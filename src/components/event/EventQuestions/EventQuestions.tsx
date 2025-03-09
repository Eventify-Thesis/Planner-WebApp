import { useParams } from 'react-router-dom';
import { PageBody } from '@/components/common/PageBody';
import { QuestionsTable } from '@/components/common/QuestionsTable';
import { TableSkeleton } from '@/components/common/TableSkeleton';
import { useEffect, useState } from 'react';
import { listQuestionsAPI } from '@/api/questions.api';

export const EventQuestions = () => {
  const { eventId } = useParams();
  const [questionQuery, setQuestionQuery] = useState<any>(null);

  useEffect(() => {
    listQuestionsAPI(eventId!).then((data) => {
      setQuestionQuery(data);
    });
  }, []);

  const reloadQuestions = async () => {
    try {
      const updatedQuestions = await listQuestionsAPI(eventId!);
      setQuestionQuery(updatedQuestions);
    } catch (error) {}
  };

  const orderQuestions = questionQuery;

  return (
    <PageBody>
      <TableSkeleton numRows={5} isVisible={!orderQuestions} />
      {orderQuestions && (
        <QuestionsTable
          questions={orderQuestions}
          reloadQuestions={reloadQuestions}
        />
      )}
    </PageBody>
  );
};

export default EventQuestions;
