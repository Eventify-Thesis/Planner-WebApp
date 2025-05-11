import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Group, Loader, Tabs, ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  useGetQuizById,
  useGetQuizQuestions,
  useGetQuizResults,
} from '@/queries/useQuizQueries';
import { useDeleteQuizQuestion } from '@/mutations/useQuizMutations';

// Import modular components
import { PageBody } from '@/components/common/PageBody';
import { PageTitle } from '@/components/common/MantinePageTitle';
import { EditQuizModal } from '@/components/game/EditQuizModal';
import { QuestionModal } from '@/components/game/QuestionModal';
import { GenerateQuestionsModal } from '@/components/game/GenerateQuestionsModal';
import { QuestionsList } from '@/components/game/QuestionsList';
import { QuizResultsList } from '@/components/game/QuizResultsList';

export const QuizDetailPage: React.FC = () => {
  const { eventId, showId, quizId } = useParams<{
    eventId: string;
    showId: string;
    quizId: string;
  }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string | null>('questions');

  // Modal states
  const [quizEditOpened, { open: openQuizEdit, close: closeQuizEdit }] =
    useDisclosure(false);
  const [
    questionModalOpened,
    { open: openQuestionModal, close: closeQuestionModal },
  ] = useDisclosure(false);
  const [
    generateModalOpened,
    { open: openGenerateModal, close: closeGenerateModal },
  ] = useDisclosure(false);

  // State for editing questions
  const [selectedQuestion, setSelectedQuestion] = useState<number | undefined>(
    undefined,
  );

  // Fetch quiz data
  const { data: quiz, isLoading: isQuizLoading } = useGetQuizById(
    eventId || '',
    quizId || '',
  );

  // Fetch quiz questions
  const { data: questions, isLoading: isQuestionsLoading } =
    useGetQuizQuestions(eventId || '', quizId || '');

  // Fetch quiz results
  const { data: results, isLoading: isResultsLoading } = useGetQuizResults(
    eventId || '',
    quizId || '',
  );

  // Mutations
  const deleteQuestionMutation = useDeleteQuizQuestion(
    eventId || '',
    quizId || '',
  );

  const handleDeleteQuestion = async (questionId: number) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestionMutation.mutateAsync(questionId);
        notifications.show({
          title: 'Success',
          message: 'Question deleted successfully',
          color: 'green',
        });
      } catch (error) {
        notifications.show({
          title: 'Error',
          message: 'Failed to delete question',
          color: 'red',
        });
      }
    }
  };

  const handleEditQuestion = (questionId: number) => {
    setSelectedQuestion(questionId);
    openQuestionModal();
  };

  const handleAddQuestion = () => {
    setSelectedQuestion(undefined);
    openQuestionModal();
  };

  if (isQuizLoading) {
    return <Loader />;
  }

  return (
    <div style={{ padding: 24 }}>
      <PageBody>
        <Group justify="space-between" mb="md">
          <Group>
            <ActionIcon
              variant="subtle"
              onClick={() =>
                navigate(`/events/${eventId}/game-management?show=${showId}`)
              }
            >
              <IconArrowLeft size={20} />
            </ActionIcon>
            <PageTitle>{quiz?.title}</PageTitle>
          </Group>
          <Button onClick={openQuizEdit}>Edit Quiz</Button>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab} mb="xl">
          <Tabs.List>
            <Tabs.Tab value="questions">Questions</Tabs.Tab>
            <Tabs.Tab value="results">Results</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="questions" pt="md">
            <QuestionsList
              questions={questions}
              isLoading={isQuestionsLoading}
              onAddQuestion={handleAddQuestion}
              onGenerateQuestions={openGenerateModal}
              onEditQuestion={handleEditQuestion}
              onDeleteQuestion={handleDeleteQuestion}
            />
          </Tabs.Panel>

          <Tabs.Panel value="results" pt="md">
            <QuizResultsList results={results} isLoading={isResultsLoading} />
          </Tabs.Panel>
        </Tabs>

        {/* Edit Quiz Modal */}
        <EditQuizModal
          eventId={eventId || ''}
          quizId={quizId || ''}
          quiz={quiz}
          opened={quizEditOpened}
          onClose={closeQuizEdit}
        />

        {/* Add/Edit Question Modal */}
        <QuestionModal
          eventId={eventId || ''}
          quizId={quizId || ''}
          question={
            selectedQuestion
              ? questions?.find((q) => q.id === selectedQuestion)
              : undefined
          }
          opened={questionModalOpened}
          onClose={closeQuestionModal}
        />

        {/* Generate Questions Modal */}
        <GenerateQuestionsModal
          eventId={eventId || ''}
          quizId={quizId || ''}
          opened={generateModalOpened}
          onClose={closeGenerateModal}
          onSuccess={() => {
            notifications.show({
              title: 'Success',
              message: 'Questions have been saved to the quiz',
              color: 'green',
            });
          }}
        />
      </PageBody>
    </div>
  );
};

export default QuizDetailPage;
