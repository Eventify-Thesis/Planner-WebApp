import { Card } from '../Card';
import { Anchor, Button, CopyButton } from '@mantine/core';
import { formatCurrency } from '../../../utils/currency.ts';
import { prettyDate } from '../../../utils/dates.ts';
import QRCode from 'react-qr-code';
import { IconCopy, IconPrinter } from '@tabler/icons-react';
import classes from './AttendeeTicket.module.scss';
import { useTranslation } from 'react-i18next';
import { TicketTypeModel } from '@/domain/TicketTypeModel.ts';
import { AttendeeModel } from '@/domain/OrderModel.ts';
import { EventModel } from '@/domain/EventModel.ts';
import { useNavigate } from 'react-router-dom';

interface AttendeeTicketProps {
  event: EventModel;
  attendee: AttendeeModel;
  ticketType: TicketTypeModel;
  hideButtons?: boolean;
}

export const AttendeeTicket = ({
  attendee,
  ticketType,
  event,
  hideButtons = false,
}: AttendeeTicketProps) => {
  const { t } = useTranslation();
  const ticketPrice = ticketType.price;
  const navigate = useNavigate();
  return (
    <Card className={classes.attendee}>
      <div className={classes.attendeeInfo}>
        <div className={classes.attendeeNameAndPrice}>
          <div className={classes.attendeeName}>
            <h2>
              {attendee.firstName} {attendee.lastName}
            </h2>
            <div className={classes.ticketName}>{ticketType.name}</div>
            <Anchor href={`mailto:${attendee.email}`}>{attendee.email}</Anchor>
          </div>
          <div className={classes.ticketPrice}>
            <div className={classes.badge}>
              {ticketPrice > 0 && formatCurrency(ticketPrice, 'VND')}
              {ticketPrice === 0 && t`Free`}
            </div>
          </div>
        </div>
        <div className={classes.eventInfo}>
          <div className={classes.eventName}>{event?.eventName}</div>
          {/* <div className={classes.eventDate}>
            {prettyDate(event.)}
          </div> */}
        </div>
      </div>
      <div className={classes.qrCode}>
        <div className={classes.attendeeCode}>{attendee.publicId}</div>

        <div className={classes.qrImage}>
          {attendee.status === 'CANCELLED' && (
            <div className={classes.cancelled}>{t`Cancelled`}</div>
          )}
          {attendee.status !== 'CANCELLED' && (
            <QRCode value={String(attendee.publicId)} />
          )}
        </div>

        {!hideButtons && (
          <div className={classes.ticketButtons}>
            <Button
              variant={'transparent'}
              size={'sm'}
              onClick={() =>
                navigate(`/ticket/${event.id}/${attendee.shortId}/print`)
              }
              leftSection={<IconPrinter size={18} />}
            >
              {t`Print`}
            </Button>

            <CopyButton
              value={`${window?.location.origin}/ticket/${event.id}/${attendee.shortId}`}
            >
              {({ copied, copy }) => (
                <Button
                  variant={'transparent'}
                  size={'sm'}
                  onClick={copy}
                  leftSection={<IconCopy size={18} />}
                >
                  {copied ? t`Copied` : t`Copy Link`}
                </Button>
              )}
            </CopyButton>
          </div>
        )}
      </div>
    </Card>
  );
};
