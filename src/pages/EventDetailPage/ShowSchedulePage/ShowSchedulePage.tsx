import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Title,
  Text,
  Select,
  LoadingOverlay,
  Group,
  Stack,
} from '@mantine/core';
import { useGetShowSchedules } from '@/queries/useGetShowSchedules';
import ShowScheduleCalendar from './ShowScheduleCalendar';
import { useGetEventShow } from '@/queries/useGetEventShow';
import { formatDate } from '@/utils/dates';

export const ShowSchedulePage: React.FC = () => {
  const { eventId } = useParams();
  const [selectedShowId, setSelectedShowId] = useState<string | undefined>(
    undefined,
  );
  const { data: shows, isLoading } = useGetEventShow(eventId || undefined);

  console.log(shows);
  useEffect(() => {
    if (shows && shows.length > 0) {
      setSelectedShowId(shows[0].id);
    }
  }, [shows]);

  // Get schedules for the selected show
  const {
    data: schedules,
    isLoading: schedulesLoading,
    error: schedulesError,
  } = useGetShowSchedules(eventId || undefined, selectedShowId || undefined);

  // Find selected show details

  if (schedulesLoading || isLoading) {
    return (
      <Box pos="relative" h={400}>
        <LoadingOverlay visible={true} />
      </Box>
    );
  }

  if (shows.length === 0) {
    return (
      <Stack spacing="md" p="md">
        <Title order={2}>Show</Title>
        <Stack p="md">
          <Text>
            No shows found for this event. Create shows to manage their
            schedules.
          </Text>
        </Stack>
      </Stack>
    );
  }

  const selectedShow = shows.find((show) => show.id == Number(selectedShowId));

  return (
    <Stack p="md">
      <Group justify="space-between">
        <Title order={2}>Show Schedule</Title>
        <Select
          data={shows.map((show) => ({
            value: String(show.id),
            label: `${formatDate(
              show.startTime,
              'DD/MM/YYYY HH:mm',
              'Asia/Bangkok',
            )} - ${formatDate(
              show.endTime,
              'DD/MM/YYYY HH:mm',
              'Asia/Bangkok',
            )}`,
          }))}
          onChange={(value) => setSelectedShowId(String(value))}
          placeholder="Select a show"
          style={{ width: 250 }}
        />
      </Group>

      {selectedShow && (
        <ShowScheduleCalendar
          showId={selectedShowId!}
          showStartTime={selectedShow.startTime}
          showEndTime={selectedShow.endTime}
          schedules={schedules || []}
          error={schedulesError}
        />
      )}
    </Stack>
  );
};

export default ShowSchedulePage;
