import React, { useState } from 'react';
import {
  Modal,
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
} from '@mantine/core';
import { CreateQuizDto } from '@/api/quiz.client';
import { useCreateQuiz } from '@/mutations/useQuizMutations';
import { notifications } from '@mantine/notifications';

interface CreateQuizModalProps {
  eventId: string | number;
  showId: string | number;
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  eventId,
  showId,
  opened,
  onClose,
  onSuccess,
}) => {
  const [quizData, setQuizData] = useState<CreateQuizDto>({
    title: '',
    passingScore: 70,
    maxAttempts: 1,
  });

  const createQuizMutation = useCreateQuiz(eventId, showId);

  const resetForm = () => {
    setQuizData({
      title: '',
      passingScore: 70,
      maxAttempts: 1,
    });
  };

  const handleCreateQuiz = async () => {
    try {
      await createQuizMutation.mutateAsync(quizData);
      notifications.show({
        title: 'Success',
        message: 'Quiz created successfully',
        color: 'green',
      });
      resetForm();
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to create quiz',
        color: 'red',
      });
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create New Quiz" centered>
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
            onClick={handleCreateQuiz}
            loading={createQuizMutation.isPending}
          >
            Create Quiz
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default CreateQuizModal;
