import React from 'react';
import {
  Card,
  Text,
  Group,
  ActionIcon,
  Stack,
  Paper,
  Loader,
  Button,
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconWand } from '@tabler/icons-react';
import { QuizQuestionModel } from '@/api/quiz.client';

interface QuestionsListProps {
  questions: QuizQuestionModel[] | undefined;
  isLoading: boolean;
  onAddQuestion: () => void;
  onGenerateQuestions: () => void;
  onEditQuestion: (questionId: number) => void;
  onDeleteQuestion: (questionId: number) => void;
}

export const QuestionsList: React.FC<QuestionsListProps> = ({
  questions,
  isLoading,
  onAddQuestion,
  onGenerateQuestions,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={600}>
          Questions ({questions?.length || 0})
        </Text>
        <Group>
          <Button
            leftSection={<IconWand size={16} />}
            variant="outline"
            onClick={onGenerateQuestions}
          >
            Auto-Generate
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={onAddQuestion}>
            Add Question
          </Button>
        </Group>
      </Group>

      {questions && questions.length > 0 ? (
        <Stack gap="xs">
          {questions.map((question, index) => (
            <Card key={question.id} withBorder shadow="sm" p="md">
              <Group justify="space-between" mb="xs">
                <Text fw={600}>Question {index + 1}</Text>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => onEditQuestion(question.id)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => onDeleteQuestion(question.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Group>
              <Text mb="md">{question.text}</Text>
              <Text size="sm" c="dimmed" mb="xs">
                Options:
              </Text>
              <Stack gap="xs">
                {question.options.map((option, optIndex) => (
                  <Paper
                    key={optIndex}
                    p="xs"
                    withBorder
                    bg={
                      optIndex === question.correctOption
                        ? 'green.1'
                        : undefined
                    }
                  >
                    <Group>
                      <Text size="sm" fw={600}>
                        {optIndex + 1}.
                      </Text>
                      <Text size="sm">{option.text}</Text>
                      {optIndex === question.correctOption && (
                        <Text size="xs" c="green" ml="auto">
                          (Correct Answer)
                        </Text>
                      )}
                    </Group>
                  </Paper>
                ))}
              </Stack>
              {question.timeLimit && (
                <Text size="sm" mt="md">
                  Time Limit: {question.timeLimit} seconds
                </Text>
              )}
            </Card>
          ))}
        </Stack>
      ) : (
        <Text c="dimmed" ta="center" py="xl">
          No questions found. Add a question or use auto-generate to get
          started.
        </Text>
      )}
    </>
  );
};

export default QuestionsList;
