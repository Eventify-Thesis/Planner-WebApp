import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  Textarea,
  NumberInput,
  Select,
  Divider,
} from '@mantine/core';
import {
  CreateQuizQuestionDto,
  UpdateQuizQuestionDto,
  QuizQuestionModel,
} from '@/api/quiz.client';
import {
  useCreateQuizQuestion,
  useUpdateQuizQuestion,
} from '@/mutations/useQuizMutations';
import { notifications } from '@mantine/notifications';

interface QuestionModalProps {
  eventId: string | number;
  quizId: string | number;
  question?: QuizQuestionModel;
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  eventId,
  quizId,
  question,
  opened,
  onClose,
  onSuccess,
}) => {
  const isEditing = !!question;

  const [questionData, setQuestionData] = useState<
    CreateQuizQuestionDto | UpdateQuizQuestionDto
  >({
    text: '',
    options: [
      { id: 0, text: '' },
      { id: 1, text: '' },
      { id: 2, text: '' },
      { id: 3, text: '' },
    ],
    correctOption: 0,
    timeLimit: 30,
    explanation: '',
  });

  // Update state when question changes (for editing)
  React.useEffect(() => {
    if (question) {
      setQuestionData({
        text: question.text,
        options: question.options,
        correctOption: question.correctOption,
        timeLimit: question.timeLimit || 30,
        explanation: question.explanation || '',
      });
    } else {
      // Reset form for new questions
      setQuestionData({
        text: '',
        options: [
          { id: 0, text: '' },
          { id: 1, text: '' },
          { id: 2, text: '' },
          { id: 3, text: '' },
        ],
        correctOption: 0,
        timeLimit: 30,
        explanation: '',
      });
    }
  }, [question]);

  const createQuestionMutation = useCreateQuizQuestion(eventId, quizId);
  const updateQuestionMutation = useUpdateQuizQuestion(
    eventId,
    quizId,
    question?.id || 0,
  );

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(questionData.options || [])];
    newOptions[index] = { id: index, text: value };
    setQuestionData({ ...questionData, options: newOptions });
  };

  const handleSaveQuestion = async () => {
    try {
      if (isEditing) {
        await updateQuestionMutation.mutateAsync(questionData);
        notifications.show({
          title: 'Success',
          message: 'Question updated successfully',
          color: 'green',
        });
      } else {
        await createQuestionMutation.mutateAsync(
          questionData as CreateQuizQuestionDto,
        );
        notifications.show({
          title: 'Success',
          message: 'Question created successfully',
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
        message: 'Failed to save question',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'Edit Question' : 'Add Question'}
      size="lg"
      centered
    >
      <Stack>
        <Textarea
          label="Question Text"
          placeholder="Enter your question"
          required
          minRows={2}
          value={questionData.text}
          onChange={(e) =>
            setQuestionData({ ...questionData, text: e.target.value })
          }
        />

        <Divider label="Options" labelPosition="center" my="md" />

        {(questionData.options || []).map((option, index) => (
          <Group key={index} grow>
            <TextInput
              label={`Option ${index + 1}`}
              placeholder={`Enter option ${index + 1}`}
              required
              value={option.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
            />
          </Group>
        ))}

        <Select
          label="Correct Answer"
          placeholder="Select the correct option"
          required
          data={[
            { value: '0', label: 'Option 1' },
            { value: '1', label: 'Option 2' },
            { value: '2', label: 'Option 3' },
            { value: '3', label: 'Option 4' },
          ]}
          value={questionData.correctOption?.toString()}
          onChange={(value) =>
            setQuestionData({ ...questionData, correctOption: Number(value) })
          }
        />

        <Textarea
          label="Explanation"
          placeholder="Enter explanation"
          required
          value={questionData.explanation}
          onChange={(e) =>
            setQuestionData({ ...questionData, explanation: e.target.value })
          }
        />

        <NumberInput
          label="Time Limit (seconds)"
          placeholder="Enter time limit"
          required
          min={5}
          max={300}
          value={questionData.timeLimit}
          onChange={(value) =>
            setQuestionData({ ...questionData, timeLimit: Number(value) })
          }
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveQuestion}
            loading={
              createQuestionMutation.isPending ||
              updateQuestionMutation.isPending
            }
          >
            {isEditing ? 'Update Question' : 'Add Question'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default QuestionModal;
