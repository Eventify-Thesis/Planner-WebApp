import { useParams } from 'react-router-dom';
import { useGetCheckInListDetail } from '../../../queries/useGetCheckInListDetail.ts';
import { useState } from 'react';
import { useDebouncedValue, useDisclosure, useNetwork } from '@mantine/hooks';
import { QueryFilters } from '@/types/types.ts';
import { showError, showSuccess } from '@/utils/notifications.tsx';
import { AxiosError } from 'axios';
import classes from './CheckIn.module.scss';
import { ActionIcon, Button, Loader, Modal, Progress } from '@mantine/core';
import { SearchBar } from '../../common/SearchBar';
import { IconInfoCircle, IconQrcode, IconTicket } from '@tabler/icons-react';
import { QRScannerComponent } from '../../common/AttendeeCheckInTable/QrScanner.tsx';
import { useGetCheckInListAttendees } from '../../../queries/useGetCheckInListAttendees.ts';
import { useCreateCheckIn } from '../../../mutations/useCreateCheckIn.ts';
import { useDeleteCheckIn } from '../../../mutations/useDeleteCheckIn.ts';
import { NoResultsSplash } from '../../common/NoResultsSplash';
import { Countdown } from './Countdown';
import Truncate from '@/components/common/Truncate';
import { Header } from './Header';
import { AttendeeModel } from '@/domain/OrderModel.ts';
import { Trans, useTranslation } from 'react-i18next';

const CheckIn = () => {
  const { eventId } = useParams();
  const { t } = useTranslation();
  const networkStatus = useNetwork();
  const { checkInListShortId } = useParams();
  const CheckInListQuery = useGetCheckInListDetail(eventId, checkInListShortId);
  const checkInList = CheckInListQuery?.data?.data;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQueryDebounced] = useDebouncedValue(searchQuery, 200);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [infoModalOpen, infoModalHandlers] = useDisclosure(false, {
    onOpen: () => {
      CheckInListQuery.refetch();
    },
  });
  const ticketTypes = checkInList?.ticketTypes;
  const queryFilters: QueryFilters = {
    pageNumber: 1,
    keyword: searchQueryDebounced,
    perPage: 100,
    filterFields: {
      status: { operator: 'eq', value: 'ACTIVE' },
    },
  };
  const attendeesQuery = useGetCheckInListAttendees(
    eventId,
    checkInListShortId,
    queryFilters,
    checkInList?.isActive && !checkInList?.isExpired,
  );
  const attendees = attendeesQuery?.data?.items;

  const checkInMutation = useCreateCheckIn({
    eventId,
    pagination: queryFilters,
  });
  const deleteCheckInMutation = useDeleteCheckIn({
    eventId,
    pagination: queryFilters,
  });

  const handleCheckInToggle = (attendee: AttendeeModel) => {
    if (attendee.checkIn) {
      deleteCheckInMutation.mutate(
        {
          checkInListShortId: checkInListShortId,
          checkInShortId: attendee.checkIn.shortId,
        },
        {
          onSuccess: () => {
            showSuccess(
              <Trans>
                {attendee.firstName} <b>checked out</b> successfully
              </Trans>,
            );
          },
          onError: (error) => {
            if (!networkStatus.online) {
              showError(t`You are offline`);
              return;
            }

            showError(error?.data.message || t`Unable to check out attendee`);
          },
        },
      );
      return;
    }

    checkInMutation.mutate(
      {
        checkInListShortId: checkInListShortId,
        attendeePublicId: attendee.publicId,
      },
      {
        onSuccess: ({ errors }) => {
          // Show error if there is an error for this specific attendee
          // It's a bulk endpoint, so even if there's an error it returns a 200
          if (errors && errors[attendee.publicId]) {
            showError(errors[attendee.publicId]);
            return;
          }

          showSuccess(
            <Trans>
              {attendee.firstName} <b>checked in</b> successfully
            </Trans>,
          );
        },
        onError: (error) => {
          if (!networkStatus.online) {
            showError(t`You are offline`);
            return;
          }

          if (error instanceof AxiosError) {
            showError(error?.data.message || t`Unable to check in attendee`);
          }
        },
      },
    );
  };

  const handleQrCheckIn = (
    attendeePublicId: string,
    onRequestComplete: (didSucceed: boolean) => void,
    onFailure: () => void,
  ) => {
    checkInMutation.mutate(
      {
        checkInListShortId: checkInListShortId,
        attendeePublicId: attendeePublicId,
      },
      {
        onSuccess: ({ errors }) => {
          if (onRequestComplete) {
            onRequestComplete(!(errors && errors[attendeePublicId]));
          }
          // Show error if there is an error for this specific attendee
          // It's a bulk endpoint, so even if there's an error it returns a 200
          if (errors && errors[attendeePublicId]) {
            showError(errors[attendeePublicId]);
            return;
          }

          showSuccess(t`Checked in successfully`);
        },
        onError: (error) => {
          onFailure();

          if (!networkStatus.online) {
            showError(t`You are offline`);
            return;
          }

          if (error.message == 'Check-in not found') {
            showError(t`User not checked in`);
            return;
          }

          if (error instanceof AxiosError) {
            showError(
              error?.response?.data.message || t`Unable to check in attendee`,
            );
          }
        },
      },
    );
  };

  const handleQrCheckOut = (
    attendeePublicId: string,
    onRequestComplete: (didSucceed: boolean) => void,
    onFailure: () => void,
  ) => {
    deleteCheckInMutation.mutate(
      {
        checkInListShortId: checkInListShortId,
        checkInShortId: attendeePublicId,
      },
      {
        onSuccess: () => {
          onRequestComplete(true);
          showSuccess(t`Checked out successfully`);
        },
        onError: (error) => {
          onFailure();

          if (!networkStatus.online) {
            showError(t`You are offline`);
            return;
          }
          if (error.message == 'Check-in not found') {
            showError(t`User not checked in`);
            return;
          }

          showError(
            error?.response?.data.message || t`Unable to check out attendee`,
          );
        },
      },
    );
  };
  const Attendees = () => {
    const Container = () => {
      if (attendeesQuery.isFetching || !attendees || !ticketTypes) {
        return (
          <div className={classes.loading}>
            <Loader size={40} />
          </div>
        );
      }

      if (attendees.length === 0) {
        return <div className={classes.noResults}>No attendees to show.</div>;
      }

      return (
        <div className={classes.attendees}>
          {attendees.map((attendee) => {
            return (
              <div className={classes.attendee} key={attendee.publicId}>
                <div className={classes.details}>
                  <div>
                    {attendee.firstName} {attendee.lastName}
                  </div>
                  <div>
                    <b>{attendee.publicId}</b>
                  </div>
                  <div className={classes.ticket}>
                    <IconTicket size={15} />{' '}
                    {
                      ticketTypes.find(
                        (ticketType) => ticketType.id === attendee.ticketTypeId,
                      )?.title
                    }
                  </div>
                </div>
                <div className={classes.actions}>
                  <Button
                    onClick={() => handleCheckInToggle(attendee)}
                    disabled={
                      checkInMutation.isPending ||
                      deleteCheckInMutation.isPending
                    }
                    loading={
                      checkInMutation.isPending ||
                      deleteCheckInMutation.isPending
                    }
                    color={attendee.checkIn ? 'red' : 'teal'}
                  >
                    {attendee.checkIn ? t`Check Out` : t`Check In`}
                  </Button>
                  {/*{attendee.check_in && (*/}
                  {/*    <div style={{color: 'gray', fontSize: 12, marginTop: 10}}>*/}
                  {/*        checked in {relativeDate(attendee.check_in.checked_in_at)}*/}
                  {/*    </div>*/}
                  {/*)}*/}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div style={{ position: 'relative' }}>
        <Container />
      </div>
    );
  };

  if (
    CheckInListQuery.error &&
    CheckInListQuery.error.response?.status === 404
  ) {
    return (
      <NoResultsSplash
        heading={t`Check-in list not found`}
        imageHref={'/blank-slate/check-in-lists.svg'}
        subHeading={
          <>
            <p>{t`The check-in list you are looking for does not exist.`}</p>
          </>
        }
      />
    );
  }

  if (checkInList?.isExpired) {
    return (
      <NoResultsSplash
        heading={t`Check-in list has expired`}
        imageHref={'/blank-slate/check-in-lists.svg'}
        subHeading={
          <>
            <p>
              <Trans>
                This check-in list has expired and is no longer available for
                check-ins.
              </Trans>
            </p>
          </>
        }
      />
    );
  }

  if (checkInList && !checkInList?.isActive) {
    return (
      <NoResultsSplash
        heading={t`Check-in list is not active`}
        imageHref={'/blank-slate/check-in-lists.svg'}
        subHeading={
          <>
            <p>
              {t`This check-in list is not yet active and is not available for check-ins.`}
            </p>
            <p>
              Check-in list will activate in <br />
              <b>
                <Countdown
                  targetDate={checkInList.activates_at as string}
                  onExpiry={() => CheckInListQuery.refetch()}
                />
              </b>
            </p>
          </>
        }
      />
    );
  }

  return (
    <div className={classes.container}>
      <Header
        fullWidth
        rightContent={
          <>
            {!networkStatus.online && (
              <div className={classes.offline}>
                {/*<IconNetworkOff color={'red'}/>*/}
              </div>
            )}
            <ActionIcon onClick={() => infoModalHandlers.open()}>
              <IconInfoCircle />
            </ActionIcon>
          </>
        }
      />
      <div className={classes.header}>
        <div>
          <h4 className={classes.title}>
            <Truncate text={checkInList?.name} length={30} />
          </h4>
        </div>
        <div className={classes.search}>
          <div className={classes.searchBar}>
            <SearchBar
              className={classes.searchInput}
              mb={20}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder={t`Seach by name, order #, attendee # or email...`}
            />
            <Button
              variant={'light'}
              size={'md'}
              className={classes.scanButton}
              onClick={() => setQrScannerOpen(true)}
              leftSection={<IconQrcode />}
            >
              {t`Scan QR Code`}
            </Button>
            <ActionIcon
              aria-label={t`Scan QR Code`}
              variant={'light'}
              size={'xl'}
              className={classes.scanIcon}
              onClick={() => setQrScannerOpen(true)}
            >
              <IconQrcode size={32} />
            </ActionIcon>
          </div>
        </div>
      </div>
      <Attendees />
      {qrScannerOpen && (
        <Modal.Root
          opened
          onClose={() => setQrScannerOpen(false)}
          fullScreen
          radius={0}
          transitionProps={{ transition: 'fade', duration: 200 }}
          padding={'none'}
        >
          <Modal.Overlay />
          <Modal.Content>
            <QRScannerComponent
              onCheckIn={handleQrCheckIn}
              onCheckOut={handleQrCheckOut}
              onClose={() => setQrScannerOpen(false)}
              attendees={attendees || []}
            />
          </Modal.Content>
        </Modal.Root>
      )}
      {infoModalOpen && (
        <Modal.Root
          opened
          radius={0}
          onClose={infoModalHandlers.close}
          transitionProps={{ transition: 'fade', duration: 200 }}
          padding={'none'}
        >
          <Modal.Overlay />

          <Modal.Content>
            <Modal.Header>
              <Modal.Title>
                <Truncate text={checkInList?.name} length={30} />{' '}
              </Modal.Title>
              <Modal.CloseButton />
            </Modal.Header>
            <div className={classes.infoModal}>
              <div className={classes.checkInCount}>
                {checkInList && (
                  <>
                    <h4>
                      <Trans>
                        {`${checkInList.checkedInAttendees}/${checkInList.totalAttendees}`}{' '}
                        checked in
                      </Trans>
                    </h4>

                    <Progress
                      value={
                        (checkInList.checkedInAttendees /
                          checkInList.totalAttendees) *
                        100
                      }
                      color={'teal'}
                      size={'xl'}
                      className={classes.progressBar}
                    />
                  </>
                )}
              </div>

              {checkInList?.description && (
                <div className={classes.description}>
                  {checkInList.description}
                </div>
              )}
            </div>
          </Modal.Content>
        </Modal.Root>
      )}
    </div>
  );
};

export default CheckIn;
