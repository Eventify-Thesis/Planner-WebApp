import React, { useState, useEffect } from 'react';
import {
  Select,
  Table,
  Button,
  Space,
  Card,
  message,
  Tag,
  Form,
  Typography,
  Row,
  Col,
  Divider,
} from 'antd';
import { useParams } from 'react-router-dom';
import { useListShows } from '@/queries/useShowQueries';
import { useListTicketTypesOfShow } from '@/queries/useTicketTypeQueries';
import { useSeatCategoryMappingQueries } from '@/queries/useSeatCategoryMappingQueries';
import {
  useGetSeatingPlanList,
  useGetSeatingPlanCategories,
} from '@/queries/useSeatingPlanQueries';

const { Title, Paragraph } = Typography;

interface MappingFormData {
  category: string;
  color?: string;
  ticketTypeId: string | null;
  id?: string;
}

interface ExistingMapping extends MappingFormData {
  id: string;
}

const EventSeatCategoryMapping: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const [selectedShow, setSelectedShow] = useState<string | null>(null);
  const [selectedSeatingPlan, setSelectedSeatingPlan] = useState<string | null>(
    null,
  );
  const [mappings, setMappings] = useState<MappingFormData[]>([]);
  const [existingMappings, setExistingMappings] = useState<ExistingMapping[]>(
    [],
  );

  // Query hooks
  const { data: shows } = useListShows(eventId!);
  const { data: seatingPlansData } = useGetSeatingPlanList(eventId!, {
    limit: 100000,
    page: 1,
  });
  const {
    useGetByShowId,
    batchCreateMutation,
    batchUpdateMutation,
    deleteByShowIdMutation,
    lockMutation,
  } = useSeatCategoryMappingQueries();

  const { data: fetchedExistingMappings, isLoading: isLoadingMappings } =
    useGetByShowId(eventId!, selectedShow || '', !!selectedShow);

  const { data: tickets, isLoading: isLoadingTickets } =
    useListTicketTypesOfShow(eventId!, selectedShow || '', {
      enabled: !!selectedShow,
    });

  const { data: categories, isLoading: isLoadingCategories } =
    useGetSeatingPlanCategories(eventId!, selectedSeatingPlan || '', {
      enabled: !!selectedSeatingPlan,
    });

  // Derived data
  const seatingPlans = seatingPlansData?.docs;
  const currentShow = shows?.find((s) => s.id === selectedShow);
  const isLocked = currentShow?.locked;

  // Effects
  useEffect(() => {
    if (fetchedExistingMappings) {
      setExistingMappings(fetchedExistingMappings);
    }
  }, [fetchedExistingMappings]);

  useEffect(() => {
    if (selectedShow && shows) {
      const show = shows.find((s) => s.id === selectedShow);
      if (show?.seatingPlan) {
        setSelectedSeatingPlan(show.seatingPlan.id);
      }
    }
  }, [selectedShow, shows]);

  useEffect(() => {
    if (categories) {
      const newMappings = categories.map((category) => {
        const existingMapping = existingMappings.find(
          (m) => m.category === category.name,
        );
        return {
          category: category.name,
          color: category.color,
          ticketTypeId: existingMapping?.ticketTypeId || null,
          id: existingMapping?.id,
        };
      });
      setMappings(newMappings);
    }
  }, [categories, existingMappings]);

  // Handlers
  const handleShowChange = (showId: string) => {
    setSelectedShow(showId);
    if (!shows?.find((s) => s.id === showId)?.seatingPlanId) {
      setSelectedSeatingPlan(null);
    }
    setMappings([]);
    setExistingMappings([]);
  };

  const handleSeatingPlanChange = (seatingPlanId: string) => {
    setSelectedSeatingPlan(seatingPlanId);
  };

  const handleTicketTypeChange = (category: string, ticketTypeId: string) => {
    if (isLocked) return; // Extra safety: do nothing if locked
    setMappings((prev) =>
      prev.map((mapping) =>
        mapping.category === category ? { ...mapping, ticketTypeId } : mapping,
      ),
    );
  };

  const handleSave = async () => {
    if (!selectedShow || !selectedSeatingPlan) {
      message.error('Please select both a show and a seating plan.');
      return;
    }

    if (isLocked) {
      message.warning('This show is locked and cannot be modified.');
      return;
    }

    const invalidMappings = mappings.filter((m) => !m.ticketTypeId);
    if (invalidMappings.length > 0) {
      message.error('Please select ticket types for all categories.');
      return;
    }

    try {
      const mappingsToCreate = mappings.filter((m) => !m.id);
      const mappingsToUpdate = mappings.filter((m) => m.id);

      if (mappingsToCreate.length > 0) {
        await batchCreateMutation.mutateAsync({
          eventId: eventId!,
          showId: selectedShow,
          mappings: mappingsToCreate.map(({ id, color, ...mapping }) => ({
            seatingPlanId: selectedSeatingPlan,
            eventId: eventId!,
            showId: selectedShow,
            ...mapping,
          })),
        });
      }

      if (mappingsToUpdate.length > 0) {
        await batchUpdateMutation.mutateAsync({
          eventId: eventId!,
          showId: selectedShow,
          mappings: mappingsToUpdate.map(({ color, ...mapping }) => ({
            id: mapping.id!,
            seatingPlanId: selectedSeatingPlan,
            eventId: eventId!,
            showId: selectedShow,
            category: mapping.category,
            ticketTypeId: mapping.ticketTypeId!,
          })),
        });
      }

      setExistingMappings(mappings);
      message.success('Mappings saved successfully.');
    } catch (error) {
      // Error handled by mutation or error boundary
    }
  };

  const handleDelete = async () => {
    if (!selectedShow) {
      message.error('Please select a show first.');
      return;
    }

    if (isLocked) {
      message.warning('This show is locked and cannot be modified.');
      return;
    }

    try {
      await deleteByShowIdMutation.mutateAsync({
        eventId: eventId!,
        showId: selectedShow,
      });
      setMappings([]);
      setExistingMappings([]);
      message.success('All mappings deleted.');
    } catch (error) {
      // Error handled by mutation or error boundary
    }
  };

  const handleLock = async (locked: boolean) => {
    if (!selectedShow || !selectedSeatingPlan) {
      message.error('Please select both a show and a seating plan first.');
      return;
    }

    try {
      await lockMutation.mutateAsync({
        eventId: eventId!,
        showId: selectedShow,
        id: selectedSeatingPlan,
        locked,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // Table definition
  const columns = [
    {
      title: 'Seat Category',
      dataIndex: 'category',
      key: 'category',
      render: (_: any, record: MappingFormData) => (
        <Tag color={record.color}>{record.category}</Tag>
      ),
    },
    {
      title: 'Ticket Type',
      dataIndex: 'ticketTypeId',
      key: 'ticketTypeId',
      render: (_: any, record: MappingFormData) => (
        <Select
          style={{ width: '100%' }}
          value={record.ticketTypeId}
          onChange={(value) => handleTicketTypeChange(record.category, value)}
          placeholder={
            isLoadingTickets ? 'Loading ticket types...' : 'Select ticket type'
          }
          loading={isLoadingTickets}
          disabled={isLoadingTickets || isLocked} // Disable if locked
          allowClear
        >
          {tickets?.map((ticket) => (
            <Select.Option key={ticket.id} value={ticket.id}>
              {ticket.name}
            </Select.Option>
          ))}
        </Select>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3} style={{ marginBottom: 4 }}>
        Seat Category Mapping
      </Title>
      <Paragraph style={{ marginBottom: 24 }}>
        Use this tool to map each seat category in the selected seating plan to
        a corresponding ticket type for the chosen show.
      </Paragraph>

      <Form layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Show" style={{ marginBottom: 16 }}>
              <Select
                placeholder="Select a show"
                value={selectedShow}
                onChange={handleShowChange}
                allowClear
              >
                {shows?.map((show) => (
                  <Select.Option key={show.id} value={show.id}>
                    {show.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Seating Plan" style={{ marginBottom: 16 }}>
              <Select
                placeholder="Select a seating plan"
                value={selectedSeatingPlan}
                onChange={handleSeatingPlanChange}
                disabled={!selectedShow || isLoadingMappings}
                loading={isLoadingMappings}
                allowClear
              >
                {seatingPlans?.map((plan) => {
                  const showSeatingPlanId = currentShow?.seatingPlanId;
                  const isPlanDisabled =
                    showSeatingPlanId && showSeatingPlanId !== plan.id;

                  return (
                    <Select.Option
                      key={plan.id}
                      value={plan.id}
                      disabled={isPlanDisabled}
                    >
                      {plan.name}
                      {showSeatingPlanId === plan.id ? ' (Current)' : ''}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Divider />

      <Table
        dataSource={mappings}
        columns={columns}
        rowKey="category"
        pagination={false}
        loading={isLoadingMappings || isLoadingTickets || isLoadingCategories}
        style={{ marginBottom: 16 }}
      />

      <Space>
        {existingMappings.length > 0 && (
          <Button
            type="primary"
            onClick={() => handleLock(!isLocked)}
            loading={lockMutation.isPending}
          >
            {isLocked ? 'Unlock' : 'Lock'}
          </Button>
        )}

        <Button
          type="primary"
          onClick={handleSave}
          loading={
            batchCreateMutation.isPending || batchUpdateMutation.isPending
          }
          disabled={
            !selectedShow ||
            !selectedSeatingPlan ||
            mappings.length === 0 ||
            isLocked
          }
        >
          Save Mappings
        </Button>
        <Button
          danger
          onClick={handleDelete}
          loading={deleteByShowIdMutation.isPending}
          disabled={!selectedShow || isLocked}
        >
          Delete All Mappings
        </Button>
      </Space>
    </Card>
  );
};

export default EventSeatCategoryMapping;
