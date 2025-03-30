import React, { useState, useEffect } from 'react';
import { Select, Table, Button, Space, Card, message, Tag } from 'antd';
import { useParams } from 'react-router-dom';
import { useListShows } from '@/queries/useShowQueries';
import { useListTicketTypesOfShow } from '@/queries/useTicketTypeQueries';
import { useSeatCategoryMappingQueries } from '@/queries/useSeatCategoryMappingQueries';
import {
  useGetSeatingPlanList,
  useGetSeatingPlanCategories,
} from '@/queries/useSeatingPlanQueries';
import { SeatCategoryMapping } from '@/api/seatCategoryMapping.client';
import { SeatingPlanCategoryModel } from '@/domain/SeatingPlanCategoryModel';

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

  const { data: shows } = useListShows(eventId!);
  const { data: seatingPlansData } = useGetSeatingPlanList(eventId!, {
    limit: 100000,
    page: 1,
  });

  const seatingPlans = seatingPlansData?.docs;

  const {
    useGetByShowId,
    batchCreateMutation,
    batchUpdateMutation,
    deleteByShowIdMutation,
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

  useEffect(() => {
    if (fetchedExistingMappings) {
      setExistingMappings(fetchedExistingMappings);
    }
  }, [fetchedExistingMappings]);

  // Handle pre-selected seating plan when show changes
  useEffect(() => {
    if (selectedShow && shows) {
      const show = shows.find((s) => s.id === selectedShow);
      if (show?.seatingPlan) {
        setSelectedSeatingPlan(show.seatingPlan.id);
      }
    }
  }, [selectedShow, shows]);

  // Update mappings when categories change
  useEffect(() => {
    if (categories) {
      const newMappings = categories.map((category) => {
        const existingMapping = existingMappings?.find(
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
    setMappings((prev) =>
      prev.map((mapping) =>
        mapping.category === category ? { ...mapping, ticketTypeId } : mapping,
      ),
    );
  };

  const handleSave = async () => {
    if (!selectedShow || !selectedSeatingPlan) {
      message.error('Please select both a show and a seating plan');
      return;
    }

    const invalidMappings = mappings.filter((m) => !m.ticketTypeId);
    if (invalidMappings.length > 0) {
      message.error('Please select ticket types for all categories');
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
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDelete = async () => {
    if (!selectedShow) {
      message.error('Please select a show first');
      return;
    }

    try {
      await deleteByShowIdMutation.mutateAsync({
        eventId: eventId!,
        showId: selectedShow,
      });
      setMappings([]);
      setExistingMappings([]);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const columns = [
    {
      title: 'Category',
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
            isLoadingTickets ? 'Loading tickets...' : 'Select ticket type'
          }
          loading={isLoadingTickets}
          disabled={isLoadingTickets}
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
    <Card title="Seat Category Mapping">
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Select
          style={{ width: '100%' }}
          placeholder="Select a show"
          value={selectedShow}
          onChange={handleShowChange}
        >
          {shows?.map((show) => (
            <Select.Option key={show.id} value={show.id}>
              {show.name}
            </Select.Option>
          ))}
        </Select>

        <Select
          style={{ width: '100%' }}
          placeholder="Select a seating plan"
          value={selectedSeatingPlan}
          onChange={handleSeatingPlanChange}
          disabled={!selectedShow || isLoadingMappings}
          loading={isLoadingMappings}
        >
          {seatingPlans?.map((plan) => (
            <Select.Option
              key={plan.id}
              value={plan.id}
              disabled={
                shows?.find((s) => s.id === selectedShow)?.seatingPlanId &&
                shows?.find((s) => s.id === selectedShow)?.seatingPlanId !==
                  plan.id
              }
            >
              {plan.name}
              {shows?.find((s) => s.id === selectedShow)?.seatingPlanId ===
              plan.id
                ? ' (Current)'
                : ''}
            </Select.Option>
          ))}
        </Select>

        <Table
          dataSource={mappings}
          columns={columns}
          rowKey="category"
          pagination={false}
          loading={isLoadingMappings || isLoadingTickets || isLoadingCategories}
        />

        <Space>
          <Button
            type="primary"
            onClick={handleSave}
            loading={
              batchCreateMutation.isPending || batchUpdateMutation.isPending
            }
            disabled={
              !selectedShow || !selectedSeatingPlan || mappings.length === 0
            }
          >
            Save Mappings
          </Button>
          <Button
            danger
            onClick={handleDelete}
            loading={deleteByShowIdMutation.isPending}
            disabled={!selectedShow}
          >
            Delete All Mappings
          </Button>
        </Space>
      </Space>
    </Card>
  );
};

export default EventSeatCategoryMapping;
