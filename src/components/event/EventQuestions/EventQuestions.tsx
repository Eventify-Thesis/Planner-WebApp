import { useParams } from 'react-router-dom';
import { PageBody } from '@/components/common/PageBody';
import { QuestionsTable } from '@/components/common/QuestionsTable';
import { TableSkeleton } from '@/components/common/TableSkeleton';
import { useListQuestions } from '@/queries/useQuestionQueries';

export const EventQuestions = () => {
  const { eventId } = useParams();
  const { data: questions, isLoading, refetch } = useListQuestions(eventId!);

  return (
    <PageBody>
      <TableSkeleton numRows={5} isVisible={isLoading} />
      {questions && (
        <QuestionsTable questions={questions} reloadQuestions={refetch} />
      )}
    </PageBody>
  );
};

export default EventQuestions;
