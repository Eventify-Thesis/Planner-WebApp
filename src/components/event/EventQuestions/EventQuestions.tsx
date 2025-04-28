import { useParams } from 'react-router-dom';
import { PageBody } from '@/components/common/PageBody';
import { QuestionsTable } from '@/components/common/QuestionsTable';
import { TableSkeleton } from '@/components/common/TableSkeleton';
import { useListQuestions } from '@/queries/useQuestionQueries';
import { PageTitle } from '@/components/common/MantinePageTitle';

export const EventQuestions = () => {
  const { eventId } = useParams();
  const { data: questions, isLoading, refetch } = useListQuestions(eventId!);

  return (
    <div
      style={{
        padding: '24px',
      }}
    >
      <PageBody>
        <PageTitle>Question</PageTitle>
        <TableSkeleton numRows={5} isVisible={isLoading} />
        {questions && (
          <QuestionsTable questions={questions} reloadQuestions={refetch} />
        )}
      </PageBody>
    </div>
  );
};

export default EventQuestions;
