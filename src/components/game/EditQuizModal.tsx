import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  NumberInput,
} from '@mantine/core';
import { UpdateQuizDto, QuizModel } from '@/api/quiz.client';
import { useUpdateQuiz } from '@/mutations/useQuizMutations';
import { notifications } from '@mantine/notifications';

interface EditQuizModalProps {
  eventId: string | number;
  quizId: string | number;
  quiz: QuizModel | undefined;
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditQuizModal: React.FC<EditQuizModalProps> = ({
  eventId,
  quizId,
  quiz,
  opened,
  onClose,
  onSuccess,
}) => {
  const [quizData, setQuizData] = useState<UpdateQuizDto>({
    title: '',
  });

  const updateQuizMutation = useUpdateQuiz(eventId, quizId);

  // Initialize quiz data when quiz is loaded
  useEffect(() => {
    if (quiz) {
      setQuizData({
        title: quiz.title,
      });
    }
  }, [quiz]);

  const handleUpdateQuiz = async () => {
    try {
      await updateQuizMutation.mutateAsync(quizData);
      notifications.show({
        title: 'Success',
        message: 'Quiz updated successfully',
        color: 'green',
      });
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update quiz',
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Quiz" centered>
      <Stack>
        <TextInput
          label="Quiz Title"
          placeholder="Enter quiz title"
          required
          value={quizData.title}
          onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateQuiz}
            loading={updateQuizMutation.isPending}
          >
            Update Quiz
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default EditQuizModal;
