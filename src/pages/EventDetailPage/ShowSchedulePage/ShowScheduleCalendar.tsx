import React, { useState, useRef } from 'react';
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
} from '@mantine/core';
// Replace Mantine DateTimePicker with Ant Design DatePicker
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconTrash, IconPlus } from '@tabler/icons-react';
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
import { useParams } from 'react-router-dom';

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

// Log the time values for debugging
const debugTimeRange = (startTime: string, endTime: string) => {
  console.log('Show start time:', startTime);
  console.log('Show end time:', endTime);
  console.log('Start date object:', new Date(startTime));
  console.log('End date object:', new Date(endTime));
  
  const startHour = new Date(startTime).getHours();
  const endHour = new Date(endTime).getHours() + 1; // Add 1 hour to end time
  
  console.log('Start hour:', startHour);
  console.log('End hour:', endHour);
  
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
        if (value < showStart)
          return 'Start time must be after show start time';
        if (value > showEnd) return 'Start time must be before show end time';
        return null;
      },
      endTime: (value, values) => {
        if (!value) return 'End time is required';
        if (value < values.startTime)
          return 'End time must be after start time';
        if (value > showEnd) return 'End time must be before show end time';
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
      scheduleId: schedule.id // Store the original ID for reference
    },
  }));

  // Handle date selection for new schedule
  const handleDateSelect = (selectInfo: DateSelectArg) => {
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
    const scheduleId = clickInfo.event.extendedProps?.scheduleId || clickInfo.event.id;
    console.log('Looking for schedule with ID:', scheduleId);
    
    // Try to find the schedule using both original ID and string conversion
    let schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) {
      // Try string comparison as fallback
      schedule = schedules.find(s => String(s.id) === String(scheduleId));
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
      // Validate times are within show boundaries
      if (startTime < showStart || endTime > showEnd) {
        changeInfo.revert();
        notifications.show({
          title: 'Invalid Time Range',
          message: 'Schedule must be within the show time boundaries',
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
    <Stack>
      <Group justify="flex-end">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={handleAddNew}
          color="teal"
        >
          Add Schedule
        </Button>
      </Group>

      <Paper shadow="xs" p="md">
        <Box style={{ height: 600 }}>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,timeGrid4Day',
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
            slotMinTime="00:00:00" // Start at midnight
            slotMaxTime="23:59:59" // End at the end of the day
            height="100%"
            // Limit the calendar to show only the time range of the show, not the whole day
            // This is commented out because we want to show the full day now
            // validRange={{
            //   start: showStart,
            //   end: new Date(showEnd.getTime() + 24 * 60 * 60 * 1000), // Add one day to include end date
            // }}
            // Add custom color theme
            eventColor="#4A5568" // More professional dark color
            eventTextColor="#FFFFFF"
            eventBorderColor="#2D3748"
            // Enable more granular time selection
            slotDuration="00:15:00" // 15-minute slots
            slotLabelInterval="01:00"
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              omitZeroMinute: false,
              meridiem: 'short',
            }}
            // Add a custom view for 4-day display
            views={{
              timeGrid4Day: {
                type: 'timeGrid',
                duration: { days: 4 },
                buttonText: '4 days',
              },
            }}
            allDaySlot={false} // Hide all-day slot to focus on hourly scheduling
            nowIndicator={true} // Show current time indicator
            weekNumbers={false}
            snapDuration="00:15:00" // Snap to 15-minute intervals
            businessHours={{
              // Show business hours for the entire day
              startTime: '00:00',
              endTime: '24:00',
            }}
            // Highlight the actual event time with a different color
            // This won't work directly but keeping for reference
            // eventDisplay="block"
            // Use event time format
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: 'short'
            }}
          />
        </Box>
      </Paper>

      {/* Schedule Form Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Schedule' : 'Add New Schedule'}
        size="md"
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
              <Text component="label" size="sm" mb={5} display="block" fw={500}>Start Time</Text>
              <DatePicker 
                showTime 
                format="DD MMM YYYY HH:mm A"
                placeholder="Select start time"
                style={{ width: '100%' }}
                value={form.values.startTime ? dayjs(form.values.startTime) : null}
                onChange={(date) => {
                  if (date) {
                    form.setFieldValue('startTime', date.toDate());
                  }
                }}
                onBlur={() => form.validateField('startTime')}
              />
              {form.errors.startTime && (
                <Text color="red" size="xs" mt={5}>{form.errors.startTime}</Text>
              )}
            </Box>

            <Box mb="sm">
              <Text component="label" size="sm" mb={5} display="block" fw={500}>End Time</Text>
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
              />
              {form.errors.endTime && (
                <Text color="red" size="xs" mt={5}>{form.errors.endTime}</Text>
              )}
            </Box>

            <Group justify="space-between" mt="md">
              {isEditing && (
                <ActionIcon color="red" onClick={handleDelete} size="lg">
                  <IconTrash size={18} />
                </ActionIcon>
              )}
              <Group>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" color="blue">
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
