import { Badge, Button, Progress } from '@mantine/core';
import {
  IconCopy,
  IconExternalLink,
  IconHelp,
  IconLink,
  IconPencil,
  IconPlus,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react';
import Truncate from '../Truncate';
import { NoResultsSplash } from '../NoResultsSplash';
import classes from './CheckInListList.module.scss';
import { Card } from '../Card';
import { Popover } from '../Popover';
import { useState } from 'react';
import { ActionMenu } from '../ActionMenu';
import { useDisclosure } from '@mantine/hooks';
import { EditCheckInListModal } from '../../modals/EditCheckInListModal';
import { useDeleteCheckInList } from '@/mutations/useDeleteCheckInList';
import { showError, showSuccess } from '@/utils/notifications.tsx';
import { confirmationDialog } from '@/utils/confirmationDialog.tsx';
import { useParams } from 'react-router-dom';
import { IdParam } from '@/types/types';
import CheckInListModel from '@/domain/CheckInListModel';
import { Trans, useTranslation } from 'react-i18next';

interface CheckInListListProps {
  checkInLists: CheckInListModel[];
  openCreateModal: () => void;
}

export const CheckInListList = ({
  checkInLists,
  openCreateModal,
}: CheckInListListProps) => {
  const { t } = useTranslation();
  const [editModalOpen, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const [selectedCheckInListId, setSelectedCheckInListId] = useState<IdParam>();
  const deleteMutation = useDeleteCheckInList();
  const { eventId } = useParams();

  const handleDeleteCheckInList = (
    checkInListId: IdParam,
    eventId: IdParam,
  ) => {
    deleteMutation.mutate(
      { checkInListId, eventId },
      {
        onSuccess: () => {
          showSuccess(t`Check-In List deleted successfully`);
        },
        onError: (error: any) => {
          showError(error.message);
        },
      },
    );
  };

  if (checkInLists.length === 0) {
    return (
      <NoResultsSplash
        heading={t`No Check-In Lists`}
        subHeading={
          <>
            <p>
              <Trans>
                <p>
                  Check-in lists help manage attendee entry for your event. You
                  can associate multiple tickets with a check-in list and ensure
                  only those with valid tickets can enter.
                </p>
              </Trans>
            </p>
            <Button
              loading={deleteMutation.isPending}
              size={'xs'}
              leftSection={<IconPlus />}
              color={'green'}
              onClick={() => openCreateModal()}
            >
              {t`Create Check-In List`}
            </Button>
          </>
        }
      />
    );
  }

  return (
    <>
      <div className={classes.checkInListList}>
        {checkInLists.map((list) => {
          const statusMessage = (function () {
            if (list.isExpired) {
              return t`This check-in list has expired`;
            }

            if (!list.isActive) {
              return t`This check-in list is not active yet`;
            }

            return t`This check-in list is active`;
          })();

          return (
            <Card className={classes.checkInListCard} key={list.id}>
              <div className={classes.checkInListHeader}>
                <div className={classes.checkInListAppliesTo}>
                  {list.ticketTypes && (
                    <Popover
                      title={list.ticketTypes.map((ticketType) => (
                        <div key={ticketType.id}>{ticketType.name}</div>
                      ))}
                      position={'bottom'}
                      withArrow
                    >
                      <div className={classes.appliesToText}>
                        <div>
                          {list.ticketTypes.length > 1 && (
                            <Trans>
                              Includes {list.ticketTypes.length} tickets type
                            </Trans>
                          )}
                          {list.ticketTypes.length === 1 &&
                            t`Includes 1 ticket`}
                        </div>
                        &nbsp;
                        <IconHelp size={16} />
                      </div>
                    </Popover>
                  )}
                </div>
                <div className={classes.capacityAssignmentStatus}>
                  <Popover title={statusMessage} position={'bottom'} withArrow>
                    <Badge
                      variant={'light'}
                      color={
                        !list.isExpired && list.isActive ? 'green' : 'gray'
                      }
                    >
                      {!list.isExpired && list.isActive
                        ? t`Active`
                        : t`Inactive`}
                    </Badge>
                  </Popover>
                </div>
              </div>
              <div className={classes.checkInListName}>
                <b>
                  <Truncate text={list.name} length={30} />
                </b>
              </div>

              <div className={classes.checkInListInfo}>
                <div className={classes.checkInListCapacity}>
                  <Progress
                    value={
                      checkInLists.length === 0
                        ? 0
                        : (list.checkedInAttendees / list.totalAttendees) * 100
                    }
                    radius={'xl'}
                    color={
                      list.checkedInAttendees === list.totalAttendees
                        ? 'purple'
                        : 'green'
                    }
                    size={'xl'}
                    style={{ marginTop: '10px' }}
                  />
                  <div className={classes.capacityText}>
                    <IconUsers size={18} /> {list.checkedInAttendees} /{' '}
                    {list.totalAttendees}
                  </div>
                </div>
                <div className={classes.checkInListActions}>
                  <ActionMenu
                    itemsGroups={[
                      {
                        label: t`Manage`,
                        items: [
                          {
                            label: t`Edit Check-In List`,
                            icon: <IconPencil size={14} />,
                            onClick: () => {
                              setSelectedCheckInListId(list.id as IdParam);
                              openEditModal();
                            },
                          },
                          {
                            label: t`Copy Check-In URL`,
                            icon: <IconCopy size={14} />,
                            onClick: () => {
                              navigator.clipboard
                                .writeText(
                                  `${window.location.origin}/events/${list.eventId}/check-in/${list.shortId}`,
                                )
                                .then(() => {
                                  showSuccess(
                                    t`Check-In URL copied to clipboard`,
                                  );
                                });
                            },
                          },
                          {
                            label: t`Open Check-In Page`,
                            icon: <IconExternalLink size={14} />,
                            onClick: () => {
                              window.open(
                                `/events/${list.eventId}/check-in/${list.shortId}`,
                                '_blank',
                              );
                            },
                          },
                        ],
                      },
                      {
                        label: t`Danger zone`,
                        items: [
                          {
                            label: t`Delete Check-In List`,
                            icon: <IconTrash size={14} />,
                            onClick: () => {
                              confirmationDialog(
                                t`Are you sure you would like to delete this Check-In List?`,
                                () => {
                                  handleDeleteCheckInList(
                                    list.id as IdParam,
                                    eventId,
                                  );
                                },
                              );
                            },
                            color: 'red',
                          },
                        ],
                      },
                    ]}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {editModalOpen && selectedCheckInListId && (
        <EditCheckInListModal
          onClose={closeEditModal}
          checkInListId={selectedCheckInListId}
        />
      )}
    </>
  );
};
