// src/pages/EventDashboard/EventDashboard.tsx
import { useGetEventStats } from '@/queries/useGetEventStats.ts';
import { useParams } from 'react-router-dom';
import { PageBody } from '@/components/common/PageBody';
import { StatBoxes } from '@/components/common/StatBoxes';
import { Card } from '@/components/common/Card';
import classes from './EventDashboard.module.scss';
import { formatCurrency } from '@/utils/currency.ts';
import { formatDate } from '@/utils/dates.ts';
import { Skeleton } from '@mantine/core';
import { PageTitle } from '@/components/common/MantinePageTitle/index.tsx';
import { Trans, useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const DashBoardSkeleton = () => (
  <>
    <Skeleton height={120} radius="l" mb="20px" />
    <Skeleton height={350} radius="l" mb="20px" />
    <Skeleton height={350} radius="l" />
  </>
);

const EventDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { eventId } = useParams();
  const { user } = useUser();
  const { data: eventStats } = useGetEventStats(eventId);

  const dateRange = eventStats
    ? `${formatDate(
        eventStats.startDate,
        'MMM DD',
        'Asia/Bangkok',
      )} - ${formatDate(eventStats.endDate, 'MMM DD', 'Asia/Bangkok')}`
    : '';

  return (
    <div style={{ padding: '20px' }}>
      <PageBody>
        <PageTitle>
          <Trans>
            Welcome back{user?.firstName && ', ' + user?.firstName} 👋
          </Trans>
        </PageTitle>

        {!eventStats && <DashBoardSkeleton />}

        {eventStats && (
          <>
            <StatBoxes />

            <Card className={classes.chartCard}>
              <div className={classes.chartCardTitle}>
                <h2>{t`Ticket Sales`}</h2>
                <div className={classes.dateRange}>
                  <span>{dateRange}</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={
                    eventStats?.dailyStats.map((stat) => ({
                      date: formatDate(stat.date, 'MMM DD', 'Asia/Bangkok'),
                      ordersCreated: stat.ordersCreated,
                      ticketsSold: stat.ticketsSold,
                    })) || []
                  }
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ordersCreated"
                    name={t`Orders Created`}
                    stroke="#2E7D32"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ticketsSold"
                    name={t`Tickets Sold`}
                    stroke="#1976D2"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className={classes.chartCard}>
              <div className={classes.chartCardTitle}>
                <h2>{t`Revenue`}</h2>
                <div className={classes.dateRange}>
                  <span>{dateRange}</span>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={
                    eventStats?.dailyStats.map((stat) => ({
                      date: formatDate(stat.date, 'MMM DD', 'Asia/Bangkok'),
                      totalSalesGross: stat.totalSalesGross,
                      totalSalesNet: stat.totalSalesNet,
                      totalDiscount: stat.totalDiscount,
                    })) || []
                  }
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value, 'VND')}
                  />
                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value as number, 'VND')
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalSalesGross"
                    name={t`Gross Sales`}
                    stroke="#D32F2F"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalSalesNet"
                    name={t`Net Sales`}
                    stroke="#1976D2"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalDiscount"
                    name={t`Total Discount`}
                    stroke="#FFA000"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </>
        )}
      </PageBody>
    </div>
  );
};

export default EventDashboard;
