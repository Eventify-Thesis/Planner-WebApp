import { Anchor, Tooltip } from '@mantine/core';
import { prettyDate, relativeDate } from '../../../utils/dates.ts';
import { OrderStatusBadge } from '../OrderStatusBadge';
import { Currency } from '../Currency';
import { Card } from '../Card';
import classes from './OrderDetails.module.scss';
import { useTranslation } from 'react-i18next';
import { OrderModel } from '@/domain/OrderModel.ts';
import { EventModel } from '@/domain/EventModel.ts';
import { timezones } from '@/data/timezones.ts';

export const OrderDetails = ({ order }: { order: OrderModel }) => {
  const { t } = useTranslation();
  return (
    <Card className={classes.orderDetails} variant={'lightGray'}>
      <div className={classes.block}>
        <div className={classes.title}>{t`Name`}</div>
        <div className={classes.amount}>
          {order.firstName} {order.lastName}
        </div>
      </div>
      <div className={classes.block}>
        <div className={classes.title}>{t`Email`}</div>
        <div className={classes.value}>
          <Anchor href={'mailto:' + order.email} target={'_blank'}>
            {order.email}
          </Anchor>
        </div>
      </div>
      <div className={classes.block}>
        <div className={classes.title}>{t`Date`}</div>
        <div className={classes.amount}>
          <Tooltip
            label={prettyDate(order.createdAt.toString(), 'Asia/Bangkok')}
            position={'bottom'}
            withArrow
          >
            <span>{relativeDate(order.createdAt.toString())}</span>
          </Tooltip>
        </div>
      </div>
      <div className={classes.block}>
        <div className={classes.title}>{t`Status`}</div>
        <div className={classes.amount}>
          <OrderStatusBadge order={order} variant={'filled'} />
        </div>
      </div>
      <div className={classes.block}>
        <div className={classes.title}>{t`Total order amount`}</div>
        <div className={classes.amount}>
          <Currency currency="VND" price={order.totalAmount} />
        </div>
      </div>

      <div className={classes.block}>
        <div className={classes.title}>{t`Total discount`}</div>
        <div className={classes.amount}>
          <Currency currency="VND" price={order.platformDiscountAmount} />
        </div>
      </div>
    </Card>
  );
};
