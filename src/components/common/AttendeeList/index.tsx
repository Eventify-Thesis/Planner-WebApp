import { ActionIcon, Avatar, Tooltip } from '@mantine/core';
import Truncate from '../Truncate';
import { NavLink } from 'react-router-dom';
import { IconEye } from '@tabler/icons-react';
import classes from './AttendeeList.module.scss';
import { getInitials } from '@/utils/helpers';
import { OrderModel } from '@/domain/OrderModel';
import { useTranslation } from 'react-i18next';
import { TicketTypeModel } from '@/domain/TicketTypeModel';

export const AttendeeList = ({
  order,
  ticketTypes,
}: {
  order: OrderModel;
  ticketTypes: TicketTypeModel[];
}) => {
  const { t } = useTranslation();
  return (
    <div className={classes.attendeeList}>
      {order.attendees?.map((attendee) => (
        <div className={classes.attendee} key={`${attendee.id}`}>
          <Avatar size={40}>
            {getInitials(attendee.firstName + ' ' + attendee.lastName)}
          </Avatar>

          <div className={classes.attendeeName}>
            {attendee.firstName + ' ' + attendee.lastName}
            <div className={classes.ticketName}>
              <Truncate
                text={
                  ticketTypes?.find(
                    (ticketType) => ticketType.id === attendee.ticketTypeId,
                  )?.name
                }
              />
            </div>
          </div>
          <div className={classes.viewAttendee}>
            <Tooltip
              label={t`Navigate to Attendee`}
              position={'bottom'}
              withArrow
            >
              <NavLink to={`../attendees?query=${attendee.id}`}>
                <ActionIcon variant={'light'}>
                  <IconEye />
                </ActionIcon>
              </NavLink>
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
  );
};
