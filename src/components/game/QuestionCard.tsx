import React from 'react';
import { Card, Group, Stack, Text, Checkbox, ActionIcon } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { QuizQuestionModel } from '@/api/quiz.client';

interface QuestionCardProps {
  question: QuizQuestionModel;
  index: number;
  isSelected: boolean;
  onToggleSelect: (questionId: number) => void;
  onEdit: (question: QuizQuestionModel) => void;
  onDelete: (questionId: number) => void;
  isDeleting: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  return (
    <Card withBorder shadow="sm" p="sm">
      <Group justify="space-between" mb="xs">
        <Group>
          <Checkbox
            checked={isSelected}
            onChange={() => onToggleSelect(question.id)}
          />
          <Text fw={500}>
            {index + 1}. {question.text}
          </Text>
        </Group>
        <Group style={{ gap: '4px' }}>
          <ActionIcon
            color="blue"
            variant="light"
            onClick={() => onEdit(question)}
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            color="red"
            variant="light"
            onClick={() => onDelete(question.id)}
            loading={isDeleting}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Stack style={{ gap: '5px' }} ml="xl">
        {question.options.map((option, optIndex) => (
          <Group key={option.id}>
            <Text
              size="sm"
              color={optIndex === question.correctOption ? 'green' : undefined}
            >
              {String.fromCharCode(65 + optIndex)}. {option.text}
              {optIndex === question.correctOption && ' (Correct)'}
            </Text>
          </Group>
        ))}

        {question.explanation && (
          <Text size="sm" fs="italic" c="dimmed">
            <Text span fw={500}>
              Explanation:
            </Text>{' '}
            {question.explanation}
          </Text>
        )}
      </Stack>
    </Card>
  );
};

export default QuestionCard;
