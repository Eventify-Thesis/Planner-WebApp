import React, { useState } from 'react';
import {
  TextInput,
  Group,
  Stack,
  NumberInput,
  Textarea,
  Card,
  ActionIcon,
  Checkbox,
  Text,
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { QuizQuestionModel } from '@/api/quiz.client';

interface EditQuestionInlineProps {
  question: QuizQuestionModel;
  onSave: (updatedQuestion: QuizQuestionModel) => void;
  onCancel: () => void;
}

export const EditQuestionInline: React.FC<EditQuestionInlineProps> = ({
  question,
  onSave,
  onCancel,
}) => {
  const [questionData, setQuestionData] = useState({
    text: question.text,
    options: [...question.options],
    correctOption: question.correctOption,
    explanation: question.explanation || '',
    timeLimit: question.timeLimit,
  });

  const handleOptionTextChange = (optionId: number, text: string) => {
    setQuestionData({
      ...questionData,
      options: questionData.options.map((option) =>
        option.id === optionId ? { ...option, text } : option,
      ),
    });
  };

  const handleSave = () => {
    onSave({
      ...question,
      text: questionData.text,
      options: questionData.options,
      correctOption: questionData.correctOption,
      explanation: questionData.explanation || undefined,
      timeLimit: questionData.timeLimit,
    });
  };

  return (
    <Card withBorder shadow="sm" p="sm" bg="gray.0">
      <Group justify="flex-end" mb="xs">
        <Group style={{ gap: '4px' }}>
          <ActionIcon color="green" variant="light" onClick={handleSave}>
            <IconCheck size={16} />
          </ActionIcon>
          <ActionIcon color="red" variant="light" onClick={onCancel}>
            <IconX size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <Stack style={{ gap: '16px' }}>
        <TextInput
          label="Question"
          value={questionData.text}
          onChange={(e) =>
            setQuestionData({ ...questionData, text: e.target.value })
          }
          required
        />

        <Stack style={{ gap: '8px' }}>
          <Text size="sm" fw={500}>
            Options
          </Text>
          {questionData.options.map((option, optIndex) => (
            <Group key={option.id} style={{ alignItems: 'center' }}>
              <Checkbox
                checked={questionData.correctOption === optIndex}
                onChange={() =>
                  setQuestionData({ ...questionData, correctOption: optIndex })
                }
                label={String.fromCharCode(65 + optIndex)}
              />
              <TextInput
                style={{ flex: 1 }}
                value={option.text}
                onChange={(e) =>
                  handleOptionTextChange(option.id, e.target.value)
                }
              />
            </Group>
          ))}
        </Stack>

        <Textarea
          label="Explanation"
          placeholder="Provide an explanation for the correct answer"
          value={questionData.explanation}
          onChange={(e) =>
            setQuestionData({ ...questionData, explanation: e.target.value })
          }
          minRows={2}
        />

        <NumberInput
          label="Time Limit (seconds)"
          value={
            questionData.timeLimit === null
              ? undefined
              : Number(questionData.timeLimit)
          }
          onChange={(value) =>
            setQuestionData({
              ...questionData,
              timeLimit: typeof value === 'number' ? value : null,
            })
          }
          min={5}
          max={300}
          step={5}
        />
      </Stack>
    </Card>
  );
};

export default EditQuestionInline;
