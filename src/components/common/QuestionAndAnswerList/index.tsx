import { QuestionAnswer } from '@/domain/QuestionModel';
import { Card } from '../Card';
import { BookingAnswerModel } from '@/domain/OrderModel';

interface QuestionAndAnswerListProps {
  questionAnswers: BookingAnswerModel[];
}

export const QuestionAndAnswerList = ({
  questionAnswers,
}: QuestionAndAnswerListProps) => {
  return (
    <Card variant={'lightGray'}>
      {questionAnswers.map((answer, index) => (
        <div key={index}>
          <strong>{answer.question.title}</strong>
          <p>{answer.answer}</p>
        </div>
      ))}
    </Card>
  );
};
