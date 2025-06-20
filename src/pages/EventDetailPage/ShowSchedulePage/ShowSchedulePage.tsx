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
  Card,
  Badge,
  Paper,
} from '@mantine/core';
import { IconCalendar, IconClock, IconDeviceTv } from '@tabler/icons-react';
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
  const selectedShow = shows?.find(
    (show: any) => show.id == Number(selectedShowId),
  );

  if (schedulesLoading || isLoading) {
    return (
      <Box pos="relative" h="100vh" w="100%">
        <LoadingOverlay
          visible={true}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
      </Box>
    );
  }

  if (!shows || shows.length === 0) {
    return (
      <Box p="xl" h="100vh" w="100%">
        <Paper shadow="sm" radius="md" p="xl" maw={600} mx="auto" mt="10%">
          <Stack align="center" gap="lg">
            <IconDeviceTv size={64} color="#64748b" />
            <Stack align="center" gap="sm">
              <Title order={2} c="dimmed">
                No Shows Found
              </Title>
              <Text c="dimmed" ta="center" maw={400}>
                No shows found for this event. Create shows first to manage
                their schedules.
              </Text>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box w="100%" h="100vh" style={{ overflow: 'hidden', padding: 10 }}>
      <Stack gap={0} h="100%">
        {/* Header Section - Fixed height */}
        <Paper
          shadow="sm"
          radius={0}
          p="lg"
          bg="gradient-to-r from-blue-50 to-indigo-50"
          style={{ borderBottom: '1px solid #e2e8f0' }}
        >
          <Group justify="space-between" align="flex-start">
            <Box>
              <Group gap="sm" mb="xs">
                <IconCalendar size={28} color="#3b82f6" />
                <Title order={1} c="blue.8">
                  Show Schedule Management
                </Title>
              </Group>
              <Text c="dimmed" size="md">
                Manage and organize schedules for your event shows
              </Text>
            </Box>

            {/* Show Selector */}
            <Card
              shadow="sm"
              radius="md"
              p="md"
              maw={400}
              w="100%"
              style={{ background: 'white' }}
            >
              <Stack gap="sm">
                <Group gap="xs">
                  <IconDeviceTv size={20} color="#6366f1" />
                  <Text fw={600} c="indigo.7">
                    Select Show
                  </Text>
                </Group>
                <Select
                  data={shows.map((show: any) => ({
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
                  value={selectedShowId}
                  onChange={(value) => setSelectedShowId(value || undefined)}
                  placeholder="Choose a show to manage"
                  size="md"
                  styles={{
                    input: {
                      borderRadius: '8px',
                      border: '2px solid #e2e8f0',
                      '&:focus': {
                        borderColor: '#3b82f6',
                      },
                    },
                  }}
                />
                {selectedShow && (
                  <Group gap="xs" mt="xs">
                    <Badge variant="light" color="blue" size="md">
                      {schedules?.length || 0} schedules
                    </Badge>
                    <Badge variant="light" color="green" size="md">
                      Active
                    </Badge>
                  </Group>
                )}
              </Stack>
            </Card>
          </Group>
        </Paper>

        {/* Calendar Section - Takes remaining height */}
        <Box flex={1} style={{ overflow: 'hidden' }}>
          {selectedShow && (
            <ShowScheduleCalendar
              showId={selectedShowId!}
              showStartTime={selectedShow.startTime}
              showEndTime={selectedShow.endTime}
              schedules={schedules || []}
              error={schedulesError}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default ShowSchedulePage;
