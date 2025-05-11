import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  NumberInput,
  Select,
  Text,
  Divider,
  Badge,
  Tabs,
} from '@mantine/core';
import {
  useGenerateQuizQuestions,
  useDeleteQuizQuestion,
  useCreateQuizQuestion,
} from '@/mutations/useQuizMutations';
import { useGetQuizQuestions } from '@/queries/useQuizQueries';
import { notifications } from '@mantine/notifications';
// No need to import icons here as they're used in the child components
import { QuizQuestionModel } from '@/api/quiz.client';

// Import modular components
import { QuestionCard } from './QuestionCard';
import { EditQuestionInline } from './EditQuestionInline';

interface GenerateQuestionsModalProps {
  eventId: string | number;
  quizId: string | number;
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const GenerateQuestionsModal: React.FC<GenerateQuestionsModalProps> = ({
  eventId,
  quizId,
  opened,
  onClose,
  onSuccess,
}) => {
  const [generationData, setGenerationData] = useState({
    topic: '',
    difficulty: 'medium',
    count: 5,
  });
  const [activeTab, setActiveTab] = useState<string | null>('generation');
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<
    QuizQuestionModel[]
  >([]);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null,
  );

  const generateQuestionsMutation = useGenerateQuizQuestions(eventId, quizId);
  const deleteQuestionMutation = useDeleteQuizQuestion(eventId, quizId);
  const createQuestionMutation = useCreateQuizQuestion(eventId, quizId);

  const handleGenerateQuestions = async () => {
    try {
      const generatedQuestions = await generateQuestionsMutation.mutateAsync({
        topic: generationData.topic,
        difficulty: generationData.difficulty,
        count: generationData.count,
      });
      setGeneratedQuestions(generatedQuestions);

      notifications.show({
        title: 'Success',
        message: `${generationData.count} questions generated successfully`,
        color: 'green',
      });

      setActiveTab('review');
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to generate questions',
        color: 'red',
      });
    }
  };

  const handleDeleteQuestion = (questionId: number) => {
    // Since questions are only in memory, just filter them out
    setGeneratedQuestions((prev) =>
      prev.filter((question) => question.id !== questionId),
    );

    // Also remove from selected questions if it was selected
    setSelectedQuestions((prev) => prev.filter((id) => id !== questionId));

    notifications.show({
      title: 'Success',
      message: 'Question removed from list',
      color: 'green',
    });
  };

  const handleEditQuestion = (question: QuizQuestionModel) => {
    // Enable inline editing for this question
    setEditingQuestionId(question.id);
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
  };

  const handleSaveEdit = (updatedQuestion: QuizQuestionModel) => {
    // Update the question in the local state
    setGeneratedQuestions((prev) =>
      prev.map((question) =>
        question.id === updatedQuestion.id ? updatedQuestion : question,
      ),
    );

    // Clear editing state
    setEditingQuestionId(null);

    notifications.show({
      title: 'Success',
      message: 'Question updated',
      color: 'green',
    });
  };

  const toggleQuestionSelection = (questionId: number) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleSaveAndClose = async () => {
    try {
      // Save each question to the database
      if (generatedQuestions.length > 0) {
        const promises = generatedQuestions.map((question) => {
          // Create a new question in the database from the generated question
          return createQuestionMutation.mutateAsync({
            quizId: Number(quizId),
            eventId: Number(eventId),
            text: question.text,
            options: question.options,
            correctOption: question.correctOption,
            explanation: question.explanation,
            timeLimit:
              question.timeLimit === null ? undefined : question.timeLimit,
          });
        });

        await Promise.all(promises);

        notifications.show({
          title: 'Success',
          message: `${generatedQuestions.length} questions saved to quiz`,
          color: 'green',
        });
      }

      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to save questions to database',
        color: 'red',
      });
    }
  };

  const handleGenerateAgain = () => {
    setActiveTab('generation');
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Generate Questions"
      size="lg"
      centered
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="generation">Generation Settings</Tabs.Tab>
          <Tabs.Tab value="review" disabled={generatedQuestions.length === 0}>
            Review Generated Questions
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="generation">
          <Stack mt="md">
            <Text size="sm" c="dimmed">
              Automatically generate quiz questions based on a topic. The system
              will create multiple-choice questions with correct answers.
            </Text>

            <TextInput
              label="Topic"
              placeholder="Enter a topic (e.g., 'World History', 'JavaScript Basics')"
              required
              value={generationData.topic}
              onChange={(e) =>
                setGenerationData({ ...generationData, topic: e.target.value })
              }
            />

            <Select
              label="Difficulty"
              placeholder="Select difficulty level"
              required
              data={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
              value={generationData.difficulty}
              onChange={(value) =>
                setGenerationData({
                  ...generationData,
                  difficulty: value || 'medium',
                })
              }
            />

            <NumberInput
              label="Number of Questions"
              placeholder="Enter number of questions to generate"
              required
              min={1}
              max={20}
              value={generationData.count}
              onChange={(value) =>
                setGenerationData({ ...generationData, count: Number(value) })
              }
            />

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerateQuestions}
                loading={generateQuestionsMutation.isPending}
                color="blue"
              >
                Generate Questions
              </Button>
            </Group>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="review">
          <Stack mt="md" spacing="md" style={{ gap: '16px' }}>
            <Group justify="space-between">
              <Text fw={500}>Generated Questions</Text>
              <Badge color="blue">{generatedQuestions.length} Questions</Badge>
            </Group>

            {generatedQuestions.length > 0 ? (
              <>
                <Stack style={{ gap: '8px' }}>
                  {generatedQuestions.map((question, index) =>
                    editingQuestionId === question.id ? (
                      <EditQuestionInline
                        key={question.id}
                        question={question}
                        onSave={handleSaveEdit}
                        onCancel={handleCancelEdit}
                      />
                    ) : (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        index={index}
                        isSelected={selectedQuestions.includes(question.id)}
                        onToggleSelect={toggleQuestionSelection}
                        onEdit={handleEditQuestion}
                        onDelete={handleDeleteQuestion}
                        isDeleting={deleteQuestionMutation.isPending}
                      />
                    ),
                  )}
                </Stack>

                <Divider my="sm" />

                <Group justify="space-between">
                  <Group>
                    <Button variant="outline" onClick={handleGenerateAgain}>
                      Generate Again
                    </Button>
                  </Group>
                  <Button color="green" onClick={handleSaveAndClose}>
                    Save and Close
                  </Button>
                </Group>
              </>
            ) : (
              <Text c="dimmed" ta="center" py="xl">
                No questions generated yet. Go back to generation settings to
                create questions.
              </Text>
            )}
          </Stack>
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
};

export default GenerateQuestionsModal;
