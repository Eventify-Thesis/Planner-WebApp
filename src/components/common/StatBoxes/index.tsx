import classes from './StatBoxes.module.scss';
import {
  IconCash,
  IconEye,
  IconReceipt,
  IconTicket,
} from '@tabler/icons-react';
import { Card } from '../Card';
import { useGetEventStats } from '../../../queries/useGetEventStats.ts';
import { useParams } from 'react-router-dom';
import { formatCurrency } from '../../../utils/currency.ts';
import { formatNumber } from '../../../utils/helpers.ts';
import { useTranslation } from 'react-i18next';

export const StatBoxes = () => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const { data: eventStats } = useGetEventStats(eventId);

  const data = [
    {
      number: formatNumber(eventStats?.totalTicketsSold as number),
      description: t('statBoxes.ticketsSold'),
      icon: <IconTicket />,
    },
    {
      number: formatCurrency(eventStats?.totalGrossSales || 0, 'VND'),
      description: t('statBoxes.grossSales'),
      icon: <IconCash />,
    },
    {
      number: formatNumber(eventStats?.totalViews as number),
      description: t('statBoxes.pageViews'),
      icon: <IconEye />,
    },
    {
      number: formatNumber(eventStats?.totalOrders as number),
      description: t('statBoxes.ordersCreated'),
      icon: <IconReceipt />,
    },
  ];

  const stats = data.map((stat) => {
    return (
      <Card className={classes.statistic} key={stat.description}>
        <div className={classes.leftPanel}>
          <div className={classes.number}>{stat.number}</div>
          <div className={classes.description}>{stat.description}</div>
        </div>
        <div className={classes.rightPanel}>
          <div className={classes.icon}>{stat.icon}</div>
        </div>
      </Card>
    );
  });

  return <div className={classes.statistics}>{stats}</div>;
};
