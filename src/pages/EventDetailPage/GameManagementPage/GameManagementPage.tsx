import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Table,
  Button,
  Group,
  Text,
  Badge,
  ActionIcon,
  Loader,
  Pagination,
} from '@mantine/core';
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconPlayerPlay,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { SearchBar } from '@/components/common/SearchBar';
import { ToolBar } from '@/components/common/ToolBar';
import { PageBody } from '@/components/common/PageBody';
import { PageTitle } from '@/components/common/MantinePageTitle';
import { CreateQuizModal } from '@/components/game/CreateQuizModal';
import { useGetQuizzes } from '@/queries/useQuizQueries';
import { useDeleteQuiz } from '@/mutations/useQuizMutations';
import { formatDate } from '@/utils/dates';
import { useGetEventShow } from '@/queries/useGetEventShow';
import { QueryFilters } from '@/types/types';
import { useFilterQueryParamSync } from '@/hooks/useFilterQueryParamSync';

export const GameManagementPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [opened, { open, close }] = useDisclosure(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const { data: shows } = useGetEventShow(eventId || '');

  // Fetch quizzes
  const [searchParams, setSearchParams] = useFilterQueryParamSync();
  const { data: quizzesData, isLoading } = useGetQuizzes(
    eventId,
    searchParams as QueryFilters,
  );

  const quizzes = quizzesData?.docs;

  if (!searchParams.showId) {
    if (shows?.length) {
      setSearchParams({ showId: shows[0].id });
    }
  }
  // Mutations
  const deleteQuizMutation = useDeleteQuiz(
    eventId || '',
    searchParams.showId || '',
  );

  // Filter quizzes based on search keyword
  const filteredQuizzes = quizzes?.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

  const handleDeleteQuiz = async (quizId: number) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteQuizMutation.mutateAsync(quizId);
        notifications.show({
          title: 'Success',
          message: 'Quiz deleted successfully',
          color: 'green',
        });
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete quiz',
          color: 'red',
        });
      }
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <PageBody>
        <PageTitle>Game Management</PageTitle>

        <ToolBar
          searchComponent={() => (
            <SearchBar
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              placeholder="Search quizzes..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.currentTarget.value)}
              onClear={() => setSearchKeyword('')}
              shows={shows?.map((show) => ({
                value: String(show.id),
                label: formatDate(show.startDate, 'MMM DD', 'Asia/Bangkok'),
              }))}
            />
          )}
        >
          <Button
            color="green"
            size="sm"
            onClick={open}
            leftSection={<IconPlus size={16} />}
          >
            Create New Quiz
          </Button>
        </ToolBar>

        {!searchParams.showId && (
          <Text c="dimmed" ta="center" py="xl">
            Please select a show to view quizzes.
          </Text>
        )}

        {isLoading ? (
          <Loader />
        ) : filteredQuizzes && filteredQuizzes.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Title</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Passing Score</Table.Th>
                <Table.Th>Max Attempts</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredQuizzes.map((quiz) => (
                <Table.Tr key={quiz.id}>
                  <Table.Td>{quiz.title}</Table.Td>
                  <Table.Td>
                    <Badge color={quiz.isCompleted ? 'green' : 'blue'}>
                      {quiz.isCompleted ? 'Completed' : 'Active'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{quiz.passingScore}%</Table.Td>
                  <Table.Td>{quiz.maxAttempts}</Table.Td>
                  <Table.Td>
                    {formatDate(quiz.createdAt, 'MMM DD', 'Asia/Bangkok')}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        component="a"
                        href={`/events/${eventId}/shows/${searchParams.showId}/game-management/${quiz.id}`}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="green"
                        component="a"
                        href={`/events/${eventId}/shows/${searchParams.showId}/game-management/${quiz.id}/play`}
                      >
                        <IconPlayerPlay size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDeleteQuiz(quiz.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <Text c="dimmed" ta="center" py="xl">
            No quizzes found. Create a new quiz to get started.
          </Text>
        )}

        {/* Create Quiz Modal */}
        <CreateQuizModal
          eventId={eventId || ''}
          showId={searchParams.showId || ''}
          opened={opened}
          onClose={close}
        />

        {!!quizzes?.length && (quizzesData?.totalDocs || 0) >= 20 && (
          <Pagination
            value={searchParams.page}
            onChange={(value) => setSearchParams({ page: value })}
            total={Number(quizzesData?.totalPages)}
          />
        )}
      </PageBody>
    </div>
  );
};

export default GameManagementPage;
