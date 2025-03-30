import React, { useEffect, useState } from 'react';
import {
  Form,
  Button,
  Select,
  Typography,
  Divider,
  Collapse,
  Space,
} from 'antd';
import {
  PlusCircleFilled,
  DeleteOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ShowingModel } from '@/domain/ShowModel';
import { TicketModal } from './TicketModal';
import { ShowHeader, StyledCollapse } from './ShowAndTicketForm.styles';
import { notificationController } from '@/controllers/notificationController';
import { FONT_SIZE, FONT_WEIGHT, BASE_COLORS } from '@/styles/themes/constants';
import { TimePickerSection } from './components/TimePickerSection';
import { TicketSection } from './components/TicketSection';
import { useParams } from 'react-router-dom';
import { useListShows, useShowMutations } from '@/queries/useShowQueries';
import { TicketTypeModel } from '@/domain/TicketTypeModel';

export const ShowAndTicketForm: React.FC<{ formRef: any }> = ({ formRef }) => {
  const { t } = useTranslation();
  const { eventId } = useParams();

  const [shows, setShows] = useState<ShowingModel[]>([
    {
      startTime: undefined,
      endTime: undefined,
      ticketTypes: [],
    },
  ]);
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [currentShow, setCurrentShow] = useState<number>();
  const [currentTicketType, setCurrentTicketType] = useState<TicketTypeModel>();
  const [activeKey, setActiveKey] = useState<string | string[]>(['0']);

  const { data: showsData, refetch: refetchShows } = useListShows(eventId!);
  const { createShowMutation, updateShowMutation, deleteShowMutation } =
    useShowMutations(eventId!);

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = dayjs().month(i);
    return {
      value: date.format('YYYY-MM'),
      label: date.format('MMMM YYYY'),
    };
  });

  const handleAddShow = () => {
    setShows([
      ...shows,
      {
        startTime: undefined,
        endTime: undefined,
        ticketTypes: [],
      },
    ]);
  };

  useEffect(() => {
    if (showsData) {
      console.log(showsData);
      // Convert API date strings to Dayjs objects

      const formattedShows = showsData.map((show) => ({
        ...show,
        startTime: show.startTime ? dayjs(show.startTime) : undefined,
        endTime: show.endTime ? dayjs(show.endTime) : undefined,
        ticketTypes: Array.isArray(show.ticketTypes) ? show.ticketTypes : [],
      }));

      if (formattedShows.length > 0) setShows(formattedShows);
      else
        setShows([
          {
            startTime: undefined,
            endTime: undefined,
            ticketTypes: [],
          },
        ]);

      if (formRef.current) {
        formRef.current.setFieldsValue({
          shows: formattedShows,
        });
      }
    }
  }, [showsData, formRef]);

  // Initialize form with existing data if available
  useEffect(() => {
    const existingValues = formRef.current?.getFieldsValue();
    if (existingValues?.shows) {
      setShows(
        existingValues.shows.map((show: ShowingModel) => ({
          ...show,
          ticketTypes: show.ticketTypes || [],
        })),
      );
    } else {
      formRef.current?.setFieldsValue({
        shows: shows,
      });
    }
  }, []);

  // Keep form values synced with state
  useEffect(() => {
    const currentValues = formRef.current?.getFieldsValue();
    const updatedValues = {
      ...currentValues,
      shows: shows.map((show) => ({
        ...show,
        startTime: show.startTime ? dayjs(show.startTime) : undefined,
        endTime: show.endTime ? dayjs(show.endTime) : undefined,
        ticketTypes: Array.isArray(show.ticketTypes)
          ? [...show.ticketTypes]
          : [],
      })),
    };
    formRef.current?.setFieldsValue(updatedValues);
  }, [shows]);

  const handleDeleteShow = (index: number) => {
    const newShows = [...shows];
    newShows.splice(index, 1);
    setShows(newShows);
    formRef.current?.setFieldsValue({ shows: newShows });
  };

  const handleOpenTicketModal = (showIndex: number) => {
    if (!shows[showIndex].startTime || !shows[showIndex].endTime) {
      notificationController.error({
        message: t('show_and_ticket.please_fill_in_the_time_range'),
      });
      // return;
    }
    setCurrentShow(showIndex);
    setCurrentTicketType(undefined);
    setTicketModalVisible(true);
  };

  const handleTimeUpdate = (show: ShowingModel, index: number) => {
    const newShows = [...shows];
    newShows[index] = show;
    setShows(newShows);
    formRef.current?.setFieldsValue({ shows: newShows });
  };

  const handleAddTicket = (showIndex: number) => {
    handleOpenTicketModal(showIndex);
  };

  const handleEditTicket = (showIndex: number, ticketTypeId: string) => {
    const ticketType = shows[showIndex].ticketTypes.find(
      (t) => t.id === ticketTypeId,
    );
    setCurrentShow(showIndex);
    setCurrentTicketType(ticketType);
    setTicketModalVisible(true);
  };

  const handleSaveTicket = (ticketType: TicketTypeModel) => {
    if (currentShow !== undefined) {
      const newShows = [...shows];
      if (currentTicketType) {
        const ticketIndex = newShows[currentShow].ticketTypes.findIndex(
          (t) => t.id === currentTicketType.id,
        );
        newShows[currentShow].ticketTypes[ticketIndex] = ticketType;
      } else {
        newShows[currentShow].ticketTypes.push({
          ...ticketType,
          id: `${Date.now()}`, // Ensure each ticketType has a unique ID
          position: newShows[currentShow].ticketTypes.length,
        });
      }

      setShows(newShows);
      setTicketModalVisible(false);
      setCurrentTicketType(undefined);
    }
  };

  const handleShowUpdate = (index: number, updatedShow: ShowingModel) => {
    const newShows = [...shows];
    newShows[index] = {
      ...updatedShow,
      ticketTypes: updatedShow.ticketTypes || [],
    };
    setShows(newShows);
  };

  const renderExtra = (showIndex: number) => (
    <>
      {activeKey.includes(showIndex.toString()) ? (
        <>
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: BASE_COLORS.white }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteShow(showIndex);
            }}
          />
        </>
      ) : (
        <Space>
          <Button
            type="text"
            icon={
              activeKey.includes(showIndex.toString()) ? (
                <CaretUpOutlined style={{ color: BASE_COLORS.black }} />
              ) : (
                <CaretDownOutlined style={{ color: BASE_COLORS.black }} />
              )
            }
            onClick={(e) => {
              setActiveKey((prev) =>
                prev.includes(showIndex.toString())
                  ? prev.filter((key) => key !== showIndex.toString())
                  : [...prev, showIndex.toString()],
              );
              e.stopPropagation();
            }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: BASE_COLORS.black }} />}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteShow(showIndex);
            }}
          />
        </Space>
      )}
    </>
  );

  const renderHeader = (show: ShowingModel, index: number) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {activeKey.includes(index.toString()) ? (
        <Typography.Text
          style={{
            color: BASE_COLORS.white,
            fontSize: FONT_SIZE.md,
            fontWeight: FONT_WEIGHT.semibold,
          }}
        >
          {t('show_and_ticket.show_date')}
        </Typography.Text>
      ) : show.startTime ? (
        <>
          <Typography.Text
            style={{
              color: show.ticketTypes.length === 0 ? 'red' : 'black',
              fontSize: FONT_SIZE.md,
              fontWeight: FONT_WEIGHT.semibold,
            }}
          >
            {show.startTime.format('MMMM D, YYYY h:mm A')}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: FONT_SIZE.xs }}>
            {show.ticketTypes.length > 0
              ? t('show_and_ticket.ticket_types_count', {
                  count: show.ticketTypes.length,
                })
              : t('show_and_ticket.please_create_ticket')}
          </Typography.Text>
        </>
      ) : (
        <Typography.Text>{t('show_and_ticket.show')}</Typography.Text>
      )}
    </div>
  );

  return (
    <Form
      ref={formRef}
      layout="vertical"
      style={{
        height: '100vh',
        padding: '0 24px 24px 24px',
        boxShadow: 'none',
      }}
    >
      <ShowHeader style={{ marginBottom: '24px' }}>
        <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
          {t('show_and_ticket.time')}
        </Typography.Title>
        <Select
          style={{ width: 200 }}
          placeholder={t('show_and_ticket.select_month')}
          value={selectedMonth}
          onChange={setSelectedMonth}
          options={months}
        />
      </ShowHeader>

      <StyledCollapse activeKey={activeKey} onChange={setActiveKey}>
        {shows.map((show, index) => (
          <Collapse.Panel
            key={index.toString()}
            header={renderHeader(show, index)}
            extra={renderExtra(index)}
            style={{ marginBottom: 16, backgroundColor: 'transparent' }}
          >
            <TimePickerSection
              show={show}
              showIndex={index}
              formRef={formRef}
              onTimeUpdate={(updatedShow) =>
                handleTimeUpdate(updatedShow, index)
              }
            />
            <TicketSection
              show={show}
              showIndex={index}
              onAddTicket={() => handleAddTicket(index)}
              onEditTicket={(ticketTypeId) =>
                handleEditTicket(index, ticketTypeId)
              }
              onShowUpdate={(updatedShow) =>
                handleShowUpdate(index, updatedShow)
              }
            />
          </Collapse.Panel>
        ))}
      </StyledCollapse>

      <Divider style={{ backgroundColor: 'white' }} />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          type="text"
          onClick={handleAddShow}
          style={{
            marginTop: 16,
            color: 'var(--primary-color)',
            paddingLeft: 0,
            fontWeight: 'bold',
            fontSize: FONT_SIZE.md,
          }}
          icon={<PlusCircleFilled />}
        >
          {t('show_and_ticket.add_show')}
        </Button>
      </div>

      <TicketModal
        visible={ticketModalVisible}
        onCancel={() => setTicketModalVisible(false)}
        onSave={handleSaveTicket}
        showStartTime={
          currentShow !== undefined ? shows[currentShow].startTime : undefined
        }
        showEndTime={
          currentShow !== undefined ? shows[currentShow].endTime : undefined
        }
        initialValues={currentTicketType}
      />
    </Form>
  );
};
