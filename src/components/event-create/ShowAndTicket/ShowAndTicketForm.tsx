import React, { useEffect, useState } from 'react';
import {
  Button,
  Select,
  Text,
  Title,
  Divider,
  Accordion,
  Group,
  Box,
  ActionIcon,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import dayjs from 'dayjs';
import 'dayjs/locale/en';
dayjs.locale('en'); // Use English locale globally
import { ShowModel } from '@/domain/ShowModel';
import { TicketModal } from './TicketModal';
import classes from './ShowAndTicketForm.module.css';
import { notificationController } from '@/controllers/notificationController';
import { FONT_SIZE, FONT_WEIGHT, BASE_COLORS } from '@/styles/themes/constants';
import { TimePickerSection } from './components/TimePickerSection';
import { TicketSection } from './components/TicketSection';
import { useParams } from 'react-router-dom';
import { useListShows, useShowMutations } from '@/queries/useShowQueries';
import { TicketTypeModel } from '@/domain/TicketTypeModel';
import { useForm } from '@mantine/form';
import { safeSetFormValues } from '@/utils/formUtils';
import { showError } from '@/utils/notifications';
import { Loading } from '@/components/common/Loading/Loading';
import './ShowAndTicketForm.css';
import { deepEqual } from 'assert';

export const ShowAndTicketForm: React.FC<{ formRef: any }> = ({ formRef }) => {
  const { t } = useTranslation();
  const { eventId } = useParams();

  const [shows, setShows] = useState<ShowModel[]>([
    {
      eventId: Number(eventId) || 0,
      name: '',
      startTime: '',
      endTime: '',
      ticketTypes: [],
    },
  ]);
  const [selectedMonth, setSelectedMonth] = useState<string>();
  const [ticketModalVisible, setTicketModalVisible] = useState(false);
  const [currentShow, setCurrentShow] = useState<number>();
  const [currentTicketType, setCurrentTicketType] = useState<TicketTypeModel>();
  const [activeKey, setActiveKey] = useState<string[]>(['0']);

  const {
    data: showsData,
    refetch: refetchShows,
    isLoading,
  } = useListShows(eventId!);

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = dayjs().month(i);
    return {
      value: date.format('YYYY-MM'),
      label: date.format('MMMM YYYY'),
    };
  });

  const form = useForm({
    initialValues: {
      shows: [],
    },
  });

  const handleAddShow = () => {
    setShows([
      ...shows,
      {
        eventId: Number(eventId) || 0,
        name: '',
        startTime: '',
        endTime: '',
        ticketTypes: [],
      },
    ]);
  };

  React.useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
  }, [formRef, form]);

  useEffect(() => {
    if (showsData) {
      // Convert API date strings to Dayjs objects

      const formattedShows = showsData.map((show) => ({
        ...show,
        startTime: show.startTime ? dayjs(show.startTime) : '',
        endTime: show.endTime ? dayjs(show.endTime) : '',
        ticketTypes: Array.isArray(show.ticketTypes) ? show.ticketTypes : [],
      }));

      if (formattedShows.length > 0) setShows(formattedShows);
      else
        setShows([
          {
            eventId: Number(eventId) || 0,
            name: '',
            startTime: '',
            endTime: '',
            ticketTypes: [],
          },
        ]);

      if (formRef.current) {
        safeSetFormValues(formRef, {
          shows: formattedShows,
        });
      }
    }
  }, [showsData, formRef]);

  // Initialize form with existing data if available
  useEffect(() => {
    const existingValues = formRef.current?.values;
    if (existingValues?.shows) {
      setShows(
        existingValues.shows.map((show: ShowModel) => ({
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
    const currentValues = formRef.current?.values;
    const updatedValues = {
      ...currentValues,
      shows: shows.map((show) => ({
        ...show,
        startTime: show.startTime ? dayjs(show.startTime) : '',
        endTime: show.endTime ? dayjs(show.endTime) : '',
        ticketTypes: Array.isArray(show.ticketTypes)
          ? [...show.ticketTypes]
          : [],
      })),
    };
    safeSetFormValues(formRef, updatedValues);
  }, [shows]);

  const handleDeleteShow = (index: number) => {
    const newShows = [...shows];
    newShows.splice(index, 1);
    setShows(newShows);
    safeSetFormValues(formRef, { shows: newShows });
  };

  const handleOpenTicketModal = (showIndex: number) => {
    // Validate that both start time and end time are set
    if (
      !shows[showIndex].startTime ||
      !shows[showIndex].endTime ||
      shows[showIndex].startTime === '' ||
      shows[showIndex].endTime === ''
    ) {
      showError(t('show_and_ticket.please_fill_in_the_time_range'));
      return; // Don't proceed with opening the modal
    }

    // Time range is valid, proceed with opening the modal
    setCurrentShow(showIndex);
    setCurrentTicketType(undefined);
    setTicketModalVisible(true);
  };

  const handleTimeUpdate = (show: ShowModel, index: number) => {
    const newShows = [...shows];
    newShows[index] = show;
    setShows(newShows);
    formRef.current?.setFieldsValue({ shows: newShows });
  };

  const handleAddTicket = (showIndex: number) => {
    handleOpenTicketModal(showIndex);
  };

  const handleEditTicket = (showIndex: number, ticketType: TicketTypeModel) => {
    setCurrentShow(showIndex);
    setCurrentTicketType(ticketType);
    setTicketModalVisible(true);
  };

  const handleSaveTicket = (ticketType: TicketTypeModel) => {
    if (currentShow !== undefined) {
      const newShows = [...shows];
      const ticketIndex = currentTicketType
        ? newShows[currentShow].ticketTypes.findIndex(
            (t) => t.id === ticketType.id,
          )
        : -1;
      if (ticketIndex !== -1) {
        newShows[currentShow].ticketTypes[ticketIndex] = ticketType;
      } else {
        newShows[currentShow].ticketTypes.push({
          ...ticketType,
          id: - (new Date().getTime() - 10000000),
          position: (newShows[currentShow].ticketTypes.length as number) || 0,
        });
      }

      setShows(newShows);
      setTicketModalVisible(false);
      setCurrentTicketType(undefined);
    }
  };

  const handleShowUpdate = (index: number, updatedShow: ShowModel) => {
    const newShows = [...shows];
    newShows[index] = {
      ...updatedShow,
      ticketTypes: updatedShow.ticketTypes || [],
    };
    setShows(newShows);
  };

  if (isLoading) {
    return <Loading />;
  }

  const renderHeader = (show: ShowModel, index: number) => (
    <Box
      className={
        activeKey.includes(index.toString())
          ? classes.headerOpen
          : classes.headerClosed
      }
    >
      {activeKey.includes(index.toString()) ? (
        <Text className={classes.headerOpen}>
          {t('show_and_ticket.show_date')}
        </Text>
      ) : show.startTime ? (
        <>
          <Text
            className={`${classes.showDate} ${
              show.ticketTypes.length === 0 ? classes.showDateWarning : ''
            }`}
          >
            {dayjs(show.startTime).format('MMMM D, YYYY h:mm A')}
          </Text>
          <Text className={classes.ticketCountText}>
            {show.ticketTypes.length > 0
              ? t('show_and_ticket.ticket_types_count', {
                  count: show.ticketTypes.length,
                })
              : t('show_and_ticket.please_create_ticket')}
          </Text>
        </>
      ) : (
        <Text>{t('show_and_ticket.show')}</Text>
      )}
    </Box>
  );

  return (
    <Box ref={formRef} className={classes.formContainer}>
      <Box className={classes.showHeader}>
        <Title order={4} style={{ color: 'white', margin: 0 }}>
          {t('show_and_ticket.time')}
        </Title>
        <Select
          w={200}
          placeholder={t('show_and_ticket.select_month')}
          value={selectedMonth}
          onChange={(value) => setSelectedMonth(value || undefined)}
          data={months}
        />
      </Box>

      <Accordion
        multiple
        value={activeKey}
        onChange={(value) => setActiveKey(value as string[])}
        style={{
          color: 'black !important',
        }}
        classNames={{
          item: classes.accordionItem,
          control: classes.accordionControl,
          panel: classes.accordionPanel,
        }}
      >
        {shows.map((show, index) => (
          <Accordion.Item key={index.toString()} value={index.toString()}>
            <Accordion.Control>
              <Box
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                {renderHeader(show, index)}
                <Group gap="xs">
                  <ActionIcon
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteShow(index);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Box>
            </Accordion.Control>
            <Accordion.Panel>
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
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>

      <Divider className={classes.divider} />
      <Box className={classes.buttonContainer}>
        <Button
          variant="subtle"
          onClick={handleAddShow}
          className={classes.addShowButton}
          leftSection={<IconPlus size={18} />}
        >
          {t('show_and_ticket.add_show')}
        </Button>
      </Box>

      <TicketModal
        visible={ticketModalVisible}
        onCancel={() => setTicketModalVisible(false)}
        onSave={handleSaveTicket}
        showStartTime={
          currentShow !== undefined && shows[currentShow]?.startTime
            ? dayjs(shows[currentShow]?.startTime).toDate()
            : undefined
        }
        showEndTime={
          currentShow !== undefined && shows[currentShow]?.endTime
            ? dayjs(shows[currentShow]?.endTime).toDate()
            : undefined
        }
        initialValues={currentTicketType}
      />
    </Box>
  );
};
