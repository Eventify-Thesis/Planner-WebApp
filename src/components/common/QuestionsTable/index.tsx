import { Button, Group, Menu, Switch, TextInput, Tooltip } from '@mantine/core';
import { IdParam } from '@/types/types.ts';
import {
  IconDotsVertical,
  IconEye,
  IconEyeClosed,
  IconGripVertical,
  IconInfoCircle,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import Truncate from '../Truncate';
import classes from './QuestionsTable.module.scss';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { Card } from '../Card';
import { useEffect, useState } from 'react';
import { EditQuestionModal } from '@/components/modals/EditQuestionModal';
import { useParams } from 'react-router-dom';
import { showError, showSuccess } from '@/utils/notifications.tsx';
import { InputGroup } from '@/components/common/InputGroup';
import { useDragItemsHandler } from '../../../hooks/useDragItemsHandler.ts';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';
import { Popover } from '../Popover';
import { useTranslation } from 'react-i18next';
import { QuestionModel } from '@/domain/QuestionModel.ts';
import { CreateQuestionModal } from '@/components/modals/CreateQuestionModal/index.tsx';
import { QuestionInput } from '../CheckoutQuestion/index.tsx';
import { modals } from '@mantine/modals';
import { useQuestionMutations } from '@/queries/useQuestionQueries';

interface QuestionsTableProp {
  questions: Partial<QuestionModel>[];
  isSystemDefault?: boolean;
  onEditModalOpen?: (id: IdParam) => void;
  showHiddenQuestions?: boolean;
  reloadQuestions?: () => void;
}

const SortableQuestion = ({
  question,
  onEditModalOpen,
  onDelete,
}: {
  question: Partial<QuestionModel>;
  onEditModalOpen?: (id: IdParam) => void;
  onDelete: (id: IdParam) => void;
  isSystemDefault?: boolean;
}) => {
  const uniqueId = question.id as UniqueIdentifier;
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: uniqueId,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div style={style} ref={setNodeRef}>
      <Card
        className={`${classes.questionCard} ${
          question.isHidden && classes.hidden
        }`}
      >
        <div
          {...attributes}
          {...listeners}
          className={classNames([classes.dragHandle, 'drag-handle'])}
        >
          <IconGripVertical size="1.05rem" stroke={1.5} />
        </div>

        <div className={classes.title}>
          <Truncate text={question.title} />{' '}
          {question.isHidden && (
            <Tooltip
              label={t('This question is only visible to the event organizer')}
            >
              <IconEyeClosed className={classes.hiddenIcon} size={14} />
            </Tooltip>
          )}
        </div>
        <div className={classes.options}>
          <Group wrap={'nowrap'} gap={0}>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <Button size={'sm'} variant={'transparent'}>
                  <IconDotsVertical size={14} />
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>{t('questions.actions')}</Menu.Label>
                <Menu.Item
                  onClick={() =>
                    onEditModalOpen ? onEditModalOpen(question.id) : null
                  }
                  leftSection={<IconPencil size={14} />}
                >
                  {t('questions.edit.title')}
                </Menu.Item>
                <Menu.Divider />

                <Menu.Label>{t('questions.danger_zone')}</Menu.Label>
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => onDelete(question.id)}
                >
                  {t('questions.delete')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </div>
      </Card>
    </div>
  );
};

const QuestionsList = ({
  questions,
  onEditModalOpen,
  showHiddenQuestions,
  reloadQuestions,
}: QuestionsTableProp) => {
  const { eventId } = useParams();
  const { t } = useTranslation();
  const { deleteQuestionMutation, sortQuestionsMutation } =
    useQuestionMutations(eventId!);

  const { items, setItems, handleDragEnd } = useDragItemsHandler({
    initialItemIds: questions.map((question) => question.id),
    onSortEnd: async (newArray) => {
      const sortQuestions = async () => {
        try {
          await sortQuestionsMutation.mutateAsync(
            newArray.map((id, index) => ({
              order: index + 1,
              id: id,
            })),
          );
          showSuccess(t('questions.sort_success'));
        } catch (error) {
          showError(t('questions.sort_error'));
        }
      };

      await sortQuestions();
    },
  });

  useEffect(() => {
    setItems(questions.map((question) => question.id));
  }, [questions]);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(TouchSensor));

  const onDelete = (id: IdParam) => {
    const handleDelete = async () => {
      try {
        await deleteQuestionMutation.mutateAsync(id as string);
        showSuccess(t('questions.delete_success'));
        if (reloadQuestions) {
          await reloadQuestions();
        }
      } catch (error) {
        showError(t('questions.delete_error'));
      }
    };

    modals.openConfirmModal({
      title: t('questions.delete_confirmation.title'),
      children: t('questions.delete_confirmation.message'),
      labels: { confirm: t('common.delete'), cancel: t('common.cancel') },
      confirmProps: { color: 'red' },
      onConfirm: handleDelete,
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items as UniqueIdentifier[]}
        strategy={verticalListSortingStrategy}
      >
        {questions
          .filter((question) => showHiddenQuestions || !question.isHidden)
          .map((question) => {
            return (
              <SortableQuestion
                key={question.id}
                question={question}
                onEditModalOpen={onEditModalOpen}
                onDelete={onDelete}
              />
            );
          })}
      </SortableContext>
    </DndContext>
  );
};

const DefaultQuestions = () => {
  const { t } = useTranslation();
  return (
    <>
      <InputGroup>
        <TextInput
          withAsterisk
          label={t('First Name')}
          placeholder={t('First name')}
        />
        <TextInput
          withAsterisk
          label={t('Last Name')}
          placeholder={t('Last Name')}
        />
      </InputGroup>

      <TextInput
        withAsterisk
        type={'email'}
        label={t('Email Address')}
        placeholder={t('Email Address')}
      />
    </>
  );
};

export const QuestionsTable = ({
  questions,
  reloadQuestions,
}: QuestionsTableProp) => {
  const { t } = useTranslation();
  const ticketQuestions = questions.filter(
    (question) => question.belongsTo === 'TICKET',
  );
  const orderQuestions = questions.filter(
    (question) => question.belongsTo === 'ORDER',
  );
  const form = useForm();
  const [createModalOpen, { open: openCreateModal, close: closeCreateModal }] =
    useDisclosure(false);
  const [editModalOpen, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [questionId, setQuestionId] = useState<IdParam>();
  const [showHiddenQuestions, setShowHiddenQuestions] = useState(false);

  // This disables the input fields in the preview
  form.getInputProps = (name: string) => ({
    id: name,
    value: form.values[name],
    onChange: () => {
      void 0;
    },
  });

  const handleModalOpen = (questionId: IdParam) => {
    setQuestionId(questionId);
    openEditModal();
  };

  const onCompleted = (question: QuestionModel) => {
    if (question.isHidden && !showHiddenQuestions) {
      setShowHiddenQuestions(true);
      showSuccess(
        t(
          'You created a hidden question but disabled the option to show hidden questions. It has been enabled.',
        ),
      );
    }
  };

  return (
    <div className={classes.outer}>
      <Card>
        <div className={classes.actions}>
          <Button
            color={'green'}
            rightSection={<IconPlus />}
            onClick={openCreateModal}
          >
            {t('Add question')}
          </Button>
          <div className={classes.hiddenToggle}>
            <Group>
              <span className={classes.hiddenCount}>
                {questions.filter((question) => question.isHidden).length}{' '}
                {questions.filter((question) => question.isHidden).length === 1
                  ? t('hidden question')
                  : t('hidden questions')}
              </span>
              <Tooltip
                label={
                  showHiddenQuestions
                    ? t('Hide hidden questions')
                    : t('Show hidden questions')
                }
              >
                <Switch
                  offLabel={<IconEyeClosed size={14} />}
                  onLabel={<IconEye size={14} />}
                  size={'sm'}
                  checked={showHiddenQuestions}
                  onChange={() => setShowHiddenQuestions(!showHiddenQuestions)}
                />
              </Tooltip>
            </Group>
          </div>
        </div>
      </Card>
      <div className={classes.container}>
        <div className={classes.questionsContainer}>
          <div className={classes.questions}>
            <h3>{t('Order questions')}</h3>
            <QuestionsList
              questions={orderQuestions}
              onEditModalOpen={handleModalOpen}
              showHiddenQuestions={showHiddenQuestions}
              reloadQuestions={reloadQuestions}
            />
            {orderQuestions.filter(
              (question) => showHiddenQuestions || !question.isHidden,
            ).length === 0 && (
              <Card className={classes.noQuestionsAlert}>
                <IconInfoCircle /> {t('You have no order questions.')}
              </Card>
            )}
          </div>
          <div className={classes.questions}>
            <h3>{t('Attendee questions')}</h3>
            <QuestionsList
              questions={ticketQuestions}
              onEditModalOpen={handleModalOpen}
              showHiddenQuestions={showHiddenQuestions}
              reloadQuestions={reloadQuestions}
            />
            {ticketQuestions.filter(
              (question) => showHiddenQuestions || !question.isHidden,
            ).length === 0 && (
              <Card className={classes.noQuestionsAlert}>
                <IconInfoCircle /> {t('You have no attendee questions.')}
              </Card>
            )}
          </div>
        </div>

        <div className={classes.previewContainer}>
          <h3>
            <Group>
              {t('Preview')}
              <Popover
                width={'400px'}
                title={t(
                  'First Name, Last Name, and Email Address are default questions and are always included in the checkout process.',
                )}
              >
                <IconInfoCircle size={18} />
              </Popover>
            </Group>
          </h3>
          <Card className={classes.previewCard}>
            <h3>{t('Order questions')}</h3>
            <div className={classes.previewForm}>
              <div className={classes.mask} />
              <DefaultQuestions />
              {orderQuestions
                .filter((question) => showHiddenQuestions || !question.isHidden)
                .map((question) => (
                  <QuestionInput
                    key={question.id}
                    question={question}
                    name={String(question.id)}
                    form={form}
                  />
                ))}

              <h3>{t('Attendee questions')}</h3>
              <DefaultQuestions />
              {ticketQuestions
                .filter((question) => showHiddenQuestions || !question.isHidden)
                .map((question) => (
                  <QuestionInput
                    key={question.id}
                    question={question}
                    name={String(question.id)}
                    form={form}
                  />
                ))}
            </div>
          </Card>
        </div>
      </div>
      {createModalOpen && (
        <CreateQuestionModal
          onCompleted={onCompleted}
          onClose={closeCreateModal}
          reloadQuestions={reloadQuestions}
        />
      )}
      {editModalOpen && questionId && (
        <EditQuestionModal
          questionId={questionId}
          onClose={closeEditModal}
          reloadQuestions={reloadQuestions}
        />
      )}
    </div>
  );
};
