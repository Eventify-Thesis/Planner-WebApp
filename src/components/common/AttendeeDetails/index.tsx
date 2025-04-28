import { Anchor } from '@mantine/core';
import { Card } from '../Card';
import classes from './AttendeeDetails.module.scss';
import { AttendeeModel } from '@/domain/OrderModel';
import { useTranslation } from 'react-i18next';
export const AttendeeDetails = ({ attendee }: { attendee: AttendeeModel }) => {
  const { t } = useTranslation();
  return (
    <Card className={classes.orderDetails} variant={'lightGray'}>
      <div className={classes.block}>
        <div className={classes.title}>{t`Name`}</div>
        <div className={classes.amount}>
          {attendee.firstName} {attendee.lastName}
        </div>
      </div>
      <div className={classes.block}>
        <div className={classes.title}>{t`Email`}</div>
        <div className={classes.value}>
          <Anchor href={'mailto:' + attendee.email} target={'_blank'}>
            {attendee.email}
          </Anchor>
        </div>
      </div>
      <div className={classes.block}>
        <div className={classes.title}>{t`Status`}</div>
        <div className={classes.amount}>{attendee.status}</div>
      </div>
      <div className={classes.block}>
        <div className={classes.title}>{t`Checked In`}</div>
        <div className={classes.amount}>
          {attendee.checkedInAt ? t`Yes` : t`No`}
        </div>
      </div>
      <div className={classes.block}>
        <div className={classes.title}>{t`Ticket`}</div>
        <div className={classes.amount}>{attendee.ticketType.name}</div>
      </div>
    </Card>
  );
};
