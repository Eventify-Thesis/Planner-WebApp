import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Button,
  Modal,
  TextInput,
  Textarea,
  Group,
  Stack,
  Text,
  ActionIcon,
  Card,
  Badge,
  Divider,
} from '@mantine/core';
// Replace Mantine DateTimePicker with Ant Design DatePicker
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import {
  IconTrash,
  IconPlus,
  IconClock,
  IconCalendar,
} from '@tabler/icons-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  EventClickArg,
  DateSelectArg,
  EventChangeArg,
} from '@fullcalendar/core';
import { useCreateSchedule } from '@/mutations/useCreateSchedule';
import { useUpdateSchedule } from '@/mutations/useUpdateSchedule';
import { useDeleteSchedule } from '@/mutations/useDeleteSchedule';
import { ScheduleModel } from '@/api/schedule.client';
import './ShowScheduleCalendar.css';
import { useParams } from 'react-router-dom';
import { formatDate } from '@/utils/dates';

interface ShowScheduleCalendarProps {
  showId: string;
  showStartTime: string;
  showEndTime: string;
  schedules: ScheduleModel[];
  error: Error | null;
}

interface ScheduleFormValues {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
}

const debugTimeRange = (startTime: string, endTime: string) => {
  console.log('Show time range:', { startTime, endTime });
};

// Utility function to format time for display
const formatTimeRange = (startTime: string, endTime: string) => {
  const start = formatDate(startTime, 'HH:mm', 'Asia/Bangkok');
  const end = formatDate(endTime, 'HH:mm', 'Asia/Bangkok');
  const date = formatDate(startTime, 'DD MMM YYYY', 'Asia/Bangkok');
  return { start, end, date };
};

// Utility function to get show time boundaries in hours
const getShowTimeBoundaries = (startTime: string, endTime: string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);

  console.log('Raw startTime string:', startTime);
  console.log('Raw endTime string:', endTime);
  console.log('Parsed start date:', start);
  console.log('Parsed end date:', end);
  console.log(
    'Start getHours():',
    start.getHours(),
    'getMinutes():',
    start.getMinutes(),
  );
  console.log(
    'End getHours():',
    end.getHours(),
    'getMinutes():',
    end.getMinutes(),
  );

  // For multi-day events, we want to use the show's daily time window
  // Since this appears to be a multi-day event from May 17 to May 30,
  // we should use the time from the start date as the daily schedule
  const startHour = start.getUTCHours() + start.getUTCMinutes() / 60;
  const endHour = end.getUTCHours() + end.getUTCMinutes() / 60;

  console.log(
    'UTC Start hours:',
    start.getUTCHours(),
    'minutes:',
    start.getUTCMinutes(),
  );
  console.log(
    'UTC End hours:',
    end.getUTCHours(),
    'minutes:',
    end.getUTCMinutes(),
  );
  console.log('Calculated startHour (decimal):', startHour);
  console.log('Calculated endHour (decimal):', endHour);

  return { startHour, endHour };
};

export const ShowScheduleCalendar: React.FC<ShowScheduleCalendarProps> = ({
  showId,
  showStartTime,
  showEndTime,
  schedules,
  error,
}) => {
  const { eventId } = useParams();
  const calendarRef = useRef<FullCalendar>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleModel | null>(null);

  // Initialize mutations
  const createScheduleMutation = useCreateSchedule(eventId);
  const updateScheduleMutation = useUpdateSchedule(eventId);
  const deleteScheduleMutation = useDeleteSchedule(eventId);

  // Parse show times
  const showStart = new Date(showStartTime);
  const showEnd = new Date(showEndTime);

  // Debug the time range - just log the values without destructuring to avoid lint error
  debugTimeRange(showStartTime, showEndTime);

  // Get formatted time range for display
  const timeRange = formatTimeRange(showStartTime, showEndTime);
  const { startHour, endHour } = getShowTimeBoundaries(
    showStartTime,
    showEndTime,
  );

  // Debug the time calculations
  console.log('Show Start Time:', showStartTime);
  console.log('Show End Time:', showEndTime);
  console.log('Calculated startHour:', startHour);
  console.log('Calculated endHour:', endHour);

  // Handle edge case where startHour and endHour are the same (daily recurring time)
  // For multi-day events, assume it's a few hours duration each day
  let actualStartHour = startHour;
  let actualEndHour = endHour;

  if (startHour === endHour && startHour > 0) {
    // If start and end are the same time, assume it's a 2-3 hour event
    actualEndHour = Math.min(24, startHour + 3);
  }

  console.log(
    'Adjusted startHour:',
    actualStartHour,
    'endHour:',
    actualEndHour,
  );

  // For multi-day events, show full 24-hour day view
  const calculatedSlotMinTime = '00:00:00';
  const calculatedSlotMaxTime = '24:00:00';

  // Option for restricted time range (commented out for multi-day events)
  // const calculatedSlotMinTime =
  //   Math.max(0, Math.floor(actualStartHour) - 6)
  //     .toString()
  //     .padStart(2, '0') + ':00:00';
  // const calculatedSlotMaxTime =
  //   Math.min(24, Math.ceil(actualEndHour) + 6)
  //     .toString()
  //     .padStart(2, '0') + ':00:00';

  console.log('Calculated slotMinTime:', calculatedSlotMinTime);
  console.log('Calculated slotMaxTime:', calculatedSlotMaxTime);

  // Initialize form
  const form = useForm<ScheduleFormValues>({
    initialValues: {
      title: '',
      description: '',
      startTime: new Date(),
      endTime: new Date(),
    },
    validate: {
      title: (value) => (value.trim().length > 0 ? null : 'Title is required'),
      startTime: (value) => {
        if (!value) return 'Start time is required';
        const startDate = value.toISOString().split('T')[0];
        const showStartDate = new Date(showStartTime)
          .toISOString()
          .split('T')[0];
        const showEndDate = new Date(showEndTime).toISOString().split('T')[0];
        if (startDate < showStartDate || startDate > showEndDate)
          return `Start time must be within show dates (${showStartDate} to ${showEndDate})`;
        return null;
      },
      endTime: (value, values) => {
        if (!value) return 'End time is required';
        if (value < values.startTime)
          return 'End time must be after start time';
        const endDate = value.toISOString().split('T')[0];
        const showStartDate = new Date(showStartTime)
          .toISOString()
          .split('T')[0];
        const showEndDate = new Date(showEndTime).toISOString().split('T')[0];
        if (endDate < showStartDate || endDate > showEndDate)
          return `End time must be within show dates (${showStartDate} to ${showEndDate})`;
        return null;
      },
    },
  });

  // Transform schedules for FullCalendar
  const calendarEvents = schedules.map((schedule) => ({
    id: String(schedule.id), // Convert ID to string to ensure type compatibility
    title: schedule.title,
    start: schedule.startTime,
    end: schedule.endTime,
    extendedProps: {
      description: schedule.description,
      scheduleId: schedule.id, // Store the original ID for reference
    },
  }));

  // Add effect to apply time range styling after calendar renders
  useEffect(() => {
    const timer = setTimeout(() => {
      applyTimeRangeStyling();
    }, 100);

    return () => clearTimeout(timer);
  }, [showStartTime, showEndTime]);

  // Effect to scroll to newly created event (DISABLED to prevent unwanted scrolling)
  // useEffect(() => {
  //   if (lastCreatedEvent && calendarRef.current && !modalOpen) {
  //     // Only scroll when modal is closed (event was successfully created)
  //     const timer = setTimeout(() => {
  //       const calendarApi = calendarRef.current?.getApi();
  //       if (calendarApi) {
  //         // Navigate to the date of the newly created event
  //         calendarApi.gotoDate(lastCreatedEvent.startTime);

  //         // Scroll to the time of the newly created event (more gently)
  //         const scrollTime = lastCreatedEvent.startTime
  //           .toTimeString()
  //           .slice(0, 8);
  //         calendarApi.scrollToTime(scrollTime);
  //       }
  //       // Clear the lastCreatedEvent after handling
  //       setLastCreatedEvent(null);
  //     }, 500); // Increased delay to ensure calendar has updated

  //     return () => clearTimeout(timer);
  //   }
  // }, [lastCreatedEvent, modalOpen]);

  // Function to apply time range styling
  const applyTimeRangeStyling = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;

    // Get current calendar view date
    const currentViewDate = calendarApi.getDate();
    const currentDateStr = currentViewDate.toISOString().split('T')[0];

    // Get show date range
    const showStartDate = new Date(showStartTime).toISOString().split('T')[0];
    const showEndDate = new Date(showEndTime).toISOString().split('T')[0];

    console.log('Current view date:', currentDateStr);
    console.log('Show date range:', { showStartDate, showEndDate });

    // Get all time slots
    const timeSlots = document.querySelectorAll('.fc-timegrid-slot');
    console.log('Found time slots:', timeSlots.length);

    timeSlots.forEach((slot) => {
      const timeElement = slot.getAttribute('data-time');
      if (timeElement) {
        // Remove existing classes
        slot.classList.remove('outside-show-range', 'within-show-range');

        // For multi-day events: if current date is within show date range,
        // make entire day available
        if (currentDateStr >= showStartDate && currentDateStr <= showEndDate) {
          // This date is within the show date range - ALL TIMES AVAILABLE
          slot.classList.add('within-show-range');
          console.log(
            `✅ Slot ${timeElement} is AVAILABLE (date ${currentDateStr} within show range ${showStartDate} to ${showEndDate})`,
          );
        } else {
          // This date is outside the show date range - NOT AVAILABLE
          slot.classList.add('outside-show-range');
          console.log(
            `❌ Slot ${timeElement} is UNAVAILABLE (date ${currentDateStr} outside show range ${showStartDate} to ${showEndDate})`,
          );
        }
      }
    });
  };

  // Handle date selection for new schedule
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    // For multi-day events, validate selection is within show date range
    const selectionStartDate = selectInfo.start.toISOString().split('T')[0];
    const selectionEndDate = selectInfo.end.toISOString().split('T')[0];
    const showStartDate = new Date(showStartTime).toISOString().split('T')[0];
    const showEndDate = new Date(showEndTime).toISOString().split('T')[0];

    if (selectionStartDate < showStartDate || selectionEndDate > showEndDate) {
      notifications.show({
        title: 'Invalid Date Selection',
        message: `Please select a date within the show schedule (${showStartDate} to ${showEndDate})`,
        color: 'orange',
      });
      return;
    }

    form.setValues({
      title: '',
      description: '',
      startTime: selectInfo.start,
      endTime: selectInfo.end,
    });
    setIsEditing(false);
    setSelectedSchedule(null);
    setModalOpen(true);
  };

  // Handle event click for editing
  const handleEventClick = (clickInfo: EventClickArg) => {
    console.log('Event clicked:', clickInfo.event);
    // Extract the scheduleId from extendedProps or fall back to the event id
    const scheduleId =
      clickInfo.event.extendedProps?.scheduleId || clickInfo.event.id;
    console.log('Looking for schedule with ID:', scheduleId);

    // Try to find the schedule using both original ID and string conversion
    let schedule = schedules.find((s) => s.id === scheduleId);
    if (!schedule) {
      // Try string comparison as fallback
      schedule = schedules.find((s) => String(s.id) === String(scheduleId));
    }

    if (schedule) {
      console.log('Found schedule to edit:', schedule);
      form.setValues({
        title: schedule.title,
        description: schedule.description,
        startTime: new Date(schedule.startTime),
        endTime: new Date(schedule.endTime),
      });
      setIsEditing(true);
      setSelectedSchedule(schedule);
      setModalOpen(true);
    } else {
      console.log('Schedule not found. Available schedules:', schedules);
      notifications.show({
        title: 'Error',
        message: 'Could not find schedule details to edit',
        color: 'red',
      });
    }
  };

  // Handle event drag and resize
  const handleEventChange = (changeInfo: EventChangeArg) => {
    const scheduleId = changeInfo.event.id;
    const startTime = changeInfo.event.start;
    const endTime = changeInfo.event.end;

    if (scheduleId && startTime && endTime) {
      // Validate dates are within show date range
      const startDate = startTime.toISOString().split('T')[0];
      const endDate = endTime.toISOString().split('T')[0];
      const showStartDate = new Date(showStartTime).toISOString().split('T')[0];
      const showEndDate = new Date(showEndTime).toISOString().split('T')[0];

      if (startDate < showStartDate || endDate > showEndDate) {
        changeInfo.revert();
        notifications.show({
          title: 'Invalid Date Range',
          message: `Schedule must be within the show date range (${showStartDate} to ${showEndDate})`,
          color: 'red',
        });
        return;
      }

      updateScheduleMutation.mutate(
        {
          id: scheduleId,
          showId,
          data: {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
          },
        },
        {
          onSuccess: () => {
            notifications.show({
              title: 'Success',
              message: 'Schedule updated successfully',
              color: 'green',
            });
          },
          onError: (error) => {
            changeInfo.revert();
            notifications.show({
              title: 'Error',
              message: error.message || 'Failed to update schedule',
              color: 'red',
            });
          },
        },
      );
    }
  };

  // Handle form submission
  const handleSubmit = (values: ScheduleFormValues) => {
    if (isEditing && selectedSchedule) {
      // Update existing schedule
      updateScheduleMutation.mutate(
        {
          id: selectedSchedule.id,
          showId,
          data: {
            title: values.title,
            description: values.description,
            startTime: values.startTime.toISOString(),
            endTime: values.endTime.toISOString(),
          },
        },
        {
          onSuccess: () => {
            setModalOpen(false);
            notifications.show({
              title: 'Success',
              message: 'Schedule updated successfully',
              color: 'green',
            });
          },
          onError: (error) => {
            notifications.show({
              title: 'Error',
              message: error.message || 'Failed to update schedule',
              color: 'red',
            });
          },
        },
      );
    } else {
      // Create new schedule
      createScheduleMutation.mutate(
        {
          showId: showId,
          title: values.title,
          description: values.description,
          startTime: values.startTime.toISOString(),
          endTime: values.endTime.toISOString(),
        },
        {
          onSuccess: () => {
            setModalOpen(false);
            notifications.show({
              title: 'Success',
              message: 'Schedule created successfully',
              color: 'green',
            });
          },
          onError: (error) => {
            notifications.show({
              title: 'Error',
              message: error.message || 'Failed to create schedule',
              color: 'red',
            });
          },
        },
      );
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedSchedule) {
      deleteScheduleMutation.mutate(
        {
          id: selectedSchedule.id,
          showId,
        },
        {
          onSuccess: () => {
            setModalOpen(false);
            notifications.show({
              title: 'Success',
              message: 'Schedule deleted successfully',
              color: 'green',
            });
          },
          onError: (error) => {
            notifications.show({
              title: 'Error',
              message: error.message || 'Failed to delete schedule',
              color: 'red',
            });
          },
        },
      );
    }
  };

  // Create a new blank schedule
  const handleAddNew = () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    form.setValues({
      title: '',
      description: '',
      startTime: now > showStart ? now : showStart,
      endTime:
        oneHourLater > showStart
          ? oneHourLater < showEnd
            ? oneHourLater
            : showEnd
          : showEnd,
    });
    setIsEditing(false);
    setSelectedSchedule(null);
    setModalOpen(true);
  };

  if (error) {
    return <Text color="red">Error loading schedules: {error.message}</Text>;
  }

  return (
    <Stack gap={0} h="100%">
      {/* Show Information Card */}
      <Card
        className="schedule-info-card"
        radius={0}
        style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}
      >
        <Group justify="space-between" align="flex-start">
          <Box>
            <Group gap="xs" mb="sm">
              <IconCalendar size={20} />
              <Text size="lg" fw={600}>
                Show Schedule
              </Text>
            </Group>
            <Group gap="md">
              <Group gap="xs">
                <IconClock size={16} />
                <Text size="sm">{timeRange.date}</Text>
              </Group>
              <Badge variant="light" color="white" size="lg">
                {timeRange.start} - {timeRange.end}
              </Badge>
            </Group>
          </Box>
          <Button
            className="add-schedule-btn"
            leftSection={<IconPlus size={16} />}
            onClick={handleAddNew}
            size="md"
          >
            Add Schedule
          </Button>
        </Group>
      </Card>

      {/* Calendar */}
      <Box flex={1} style={{ overflow: 'hidden' }}>
        <Paper
          className="show-schedule-calendar"
          shadow="none"
          p={0}
          radius={0}
          h="100%"
        >
          <Box h="100%">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              initialView="timeGridWeek"
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              events={calendarEvents}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventChange={handleEventChange}
              editable={true}
              droppable={true}
              // Restrict time display to show time range with some padding
              slotMinTime={calculatedSlotMinTime}
              slotMaxTime={calculatedSlotMaxTime}
              height="100%"
              // Restrict valid date range to show dates only
              validRange={{
                start: showStart,
                end: new Date(showEnd.getTime() + 24 * 60 * 60 * 1000), // Add one day to include end date
              }}
              // Enhanced styling
              eventColor="#667eea"
              eventTextColor="#ffffff"
              eventBorderColor="#5a67d8"
              // Enable more granular time selection
              slotDuration="00:15:00" // 15-minute slots
              slotLabelInterval="01:00"
              slotLabelFormat={{
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: false,
                meridiem: 'short',
              }}
              allDaySlot={false} // Hide all-day slot to focus on hourly scheduling
              nowIndicator={true} // Show current time indicator
              weekNumbers={false}
              snapDuration="00:15:00" // Snap to 15-minute intervals
              businessHours={{
                // Highlight show time range as business hours
                startTime:
                  showStart.getHours().toString().padStart(2, '0') +
                  ':' +
                  showStart.getMinutes().toString().padStart(2, '0'),
                endTime:
                  showEnd.getHours().toString().padStart(2, '0') +
                  ':' +
                  showEnd.getMinutes().toString().padStart(2, '0'),
              }}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short',
              }}
              // Callback to apply custom styling after render
              datesSet={applyTimeRangeStyling}
              eventDidMount={applyTimeRangeStyling}
              // Prevent unwanted scrolling behaviors
              scrollTime="08:00:00" // Set a reasonable default scroll time
              scrollTimeReset={false} // Don't reset scroll time on view change
            />
          </Box>
        </Paper>
      </Box>

      {/* Schedule Form Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <Group gap="xs">
            <IconCalendar size={20} />
            <Text size="lg" fw={600}>
              {isEditing ? 'Edit Schedule' : 'Add New Schedule'}
            </Text>
          </Group>
        }
        size="md"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Title"
              placeholder="Enter schedule title"
              required
              {...form.getInputProps('title')}
            />

            <Textarea
              label="Description"
              placeholder="Enter schedule description"
              minRows={3}
              {...form.getInputProps('description')}
            />

            <Box mb="sm">
              <Text component="label" size="sm" mb={5} display="block" fw={500}>
                Start Time
              </Text>
              <DatePicker
                showTime
                format="DD MMM YYYY HH:mm A"
                placeholder="Select start time"
                style={{ width: '100%' }}
                value={
                  form.values.startTime ? dayjs(form.values.startTime) : null
                }
                onChange={(date) => {
                  if (date) {
                    form.setFieldValue('startTime', date.toDate());
                  }
                }}
                onBlur={() => form.validateField('startTime')}
                // Restrict to show date range
                disabledDate={(current) => {
                  const showDate = dayjs(showStart).startOf('day');
                  const endDate = dayjs(showEnd).endOf('day');
                  return current && (current < showDate || current > endDate);
                }}
              />
              {form.errors.startTime && (
                <Text color="red" size="xs" mt={5}>
                  {form.errors.startTime}
                </Text>
              )}
            </Box>

            <Box mb="sm">
              <Text component="label" size="sm" mb={5} display="block" fw={500}>
                End Time
              </Text>
              <DatePicker
                showTime
                format="DD MMM YYYY HH:mm A"
                placeholder="Select end time"
                style={{ width: '100%' }}
                value={form.values.endTime ? dayjs(form.values.endTime) : null}
                onChange={(date) => {
                  if (date) {
                    form.setFieldValue('endTime', date.toDate());
                  }
                }}
                onBlur={() => form.validateField('endTime')}
                // Restrict to show date range
                disabledDate={(current) => {
                  const showDate = dayjs(showStart).startOf('day');
                  const endDate = dayjs(showEnd).endOf('day');
                  return current && (current < showDate || current > endDate);
                }}
              />
              {form.errors.endTime && (
                <Text color="red" size="xs" mt={5}>
                  {form.errors.endTime}
                </Text>
              )}
            </Box>

            <Divider />

            <Group justify="space-between" mt="md">
              {isEditing && (
                <ActionIcon
                  color="red"
                  onClick={handleDelete}
                  size="lg"
                  variant="light"
                >
                  <IconTrash size={18} />
                </ActionIcon>
              )}
              <Group ml="auto">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="blue"
                  loading={
                    createScheduleMutation.isPending ||
                    updateScheduleMutation.isPending
                  }
                >
                  {isEditing ? 'Save Changes' : 'Create Schedule'}
                </Button>
              </Group>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
};

export default ShowScheduleCalendar;
