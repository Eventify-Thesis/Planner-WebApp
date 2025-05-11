import React from 'react';
import {
  Card,
  Text,
  Table,
  Badge,
  Loader,
  Title,
} from '@mantine/core';
import { QuizResultModel } from '@/api/quiz.client';

interface QuizResultsListProps {
  results: QuizResultModel[] | undefined;
  isLoading: boolean;
}

export const QuizResultsList: React.FC<QuizResultsListProps> = ({
  results,
  isLoading,
}) => {
  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Text size="lg" fw={600} mb="md">
        Quiz Results
      </Text>

      {results && results.length > 0 ? (
        <Card withBorder shadow="sm">
          <Title order={4} mb="md">
            Participant Results
          </Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User</Table.Th>
                <Table.Th>Score</Table.Th>
                <Table.Th>Correct Answers</Table.Th>
                <Table.Th>Time Taken</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Completed At</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {results.map((result) => (
                <Table.Tr key={result.id}>
                  <Table.Td>{result.userId}</Table.Td>
                  <Table.Td>{result.score}%</Table.Td>
                  <Table.Td>
                    {result.correctAnswers}/{result.totalQuestions}
                  </Table.Td>
                  <Table.Td>{result.timeTaken.toFixed(1)}s</Table.Td>
                  <Table.Td>
                    <Badge color={result.isPassed ? 'green' : 'red'}>
                      {result.isPassed ? 'Passed' : 'Failed'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {new Date(result.completedAt).toLocaleString()}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      ) : (
        <Text c="dimmed" ta="center" py="xl">
          No results available yet.
        </Text>
      )}
    </>
  );
};

export default QuizResultsList;
