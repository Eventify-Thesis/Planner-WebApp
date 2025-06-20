// src/pages/EventDashboard/EventDashboard.tsx
import { useGetEventStats } from '@/queries/useGetEventStats.ts';
import { useParams } from 'react-router-dom';
import { PageBody } from '@/components/common/PageBody';
import { StatBoxes } from '@/components/common/StatBoxes';
import { Card } from '@/components/common/Card';
import classes from './EventDashboard.module.scss';
import { formatCurrency } from '@/utils/currency.ts';
import { formatDate } from '@/utils/dates.ts';
import { Skeleton, Group, Button, Text, Badge, Stack } from '@mantine/core';
import { PageTitle } from '@/components/common/MantinePageTitle/index.tsx';
import { Trans, useTranslation } from 'react-i18next';
import { useUser } from '@clerk/clerk-react';
import { DatePicker } from 'antd';
import { IconCalendar, IconRefresh, IconTrendingUp } from '@tabler/icons-react';
import { useState } from 'react';
import dayjs from 'dayjs';
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

  // Date range state
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([dayjs().subtract(7, 'days'), dayjs()]);

  const {
    data: eventStats,
    isLoading,
    refetch,
  } = useGetEventStats(eventId, {
    startDate: dateRange[0]?.toISOString(),
    endDate: dateRange[1]?.toISOString(),
  });

  const formattedDateRange = eventStats
    ? `${formatDate(
        eventStats.startDate,
        'MMM DD',
        'Asia/Bangkok',
      )} - ${formatDate(eventStats.endDate, 'MMM DD', 'Asia/Bangkok')}`
    : '';

  const handleDateRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
  ) => {
    if (dates) {
      setDateRange(dates);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const quickRangeButtons = [
    { label: t`Last 7 days`, days: 7 },
    { label: t`Last 30 days`, days: 30 },
    { label: t`Last 90 days`, days: 90 },
  ];

  const setQuickRange = (days: number) => {
    setDateRange([dayjs().subtract(days, 'days'), dayjs()]);
  };

  return (
    <div className={classes.dashboardContainer}>
      <PageBody>
        <div className={classes.header}>
          <PageTitle>
            <Trans>
              Welcome back{user?.firstName && ', ' + user?.firstName} 👋
            </Trans>
          </PageTitle>

          <Group gap="md" className={classes.controls}>
            <DatePicker.RangePicker
              placeholder={[t`Start date`, t`End date`]}
              value={dateRange}
              onChange={handleDateRangeChange}
              className={classes.datePicker}
              allowClear
              format="YYYY-MM-DD"
              suffixIcon={<IconCalendar size={16} />}
            />

            <Group gap="xs">
              {quickRangeButtons.map((button) => (
                <Button
                  key={button.days}
                  variant="light"
                  size="xs"
                  onClick={() => setQuickRange(button.days)}
                >
                  {button.label}
                </Button>
              ))}
            </Group>

            <Button
              variant="light"
              leftSection={<IconRefresh size={16} />}
              onClick={handleRefresh}
              loading={isLoading}
            >
              {t`Refresh`}
            </Button>
          </Group>
        </div>

        {isLoading && <DashBoardSkeleton />}

        {eventStats && (
          <Stack gap="lg">
            <StatBoxes />

            <Card className={classes.chartCard}>
              <div className={classes.chartCardHeader}>
                <div className={classes.chartCardTitle}>
                  <Group gap="sm">
                    <IconTrendingUp size={20} />
                    <Text size="lg" fw={600}>{t`Ticket Sales Overview`}</Text>
                  </Group>
                  <Badge variant="light" color="blue">
                    {formattedDateRange}
                  </Badge>
                </div>

                <Group gap="lg" className={classes.chartStats}>
                  <div className={classes.statItem}>
                    <Text size="sm" c="dimmed">{t`Total Orders`}</Text>
                    <Text size="xl" fw={700} c="green">
                      {eventStats.totalOrders}
                    </Text>
                  </div>
                  <div className={classes.statItem}>
                    <Text size="sm" c="dimmed">{t`Tickets Sold`}</Text>
                    <Text size="xl" fw={700} c="blue">
                      {eventStats.totalTicketsSold}
                    </Text>
                  </div>
                </Group>
              </div>

              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={
                    eventStats?.dailyStats.map((stat: any) => ({
                      date: formatDate(stat.date, 'MMM DD', 'Asia/Bangkok'),
                      ordersCreated: stat.ordersCreated,
                      ticketsSold: stat.ticketsSold,
                    })) || []
                  }
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#666" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ordersCreated"
                    name={t`Orders Created`}
                    stroke="#2E7D32"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#2E7D32' }}
                    activeDot={{ r: 7, fill: '#2E7D32' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ticketsSold"
                    name={t`Tickets Sold`}
                    stroke="#1976D2"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#1976D2' }}
                    activeDot={{ r: 7, fill: '#1976D2' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className={classes.chartCard}>
              <div className={classes.chartCardHeader}>
                <div className={classes.chartCardTitle}>
                  <Group gap="sm">
                    <IconTrendingUp size={20} />
                    <Text size="lg" fw={600}>{t`Revenue Analytics`}</Text>
                  </Group>
                  <Badge variant="light" color="green">
                    {formattedDateRange}
                  </Badge>
                </div>

                <Group gap="lg" className={classes.chartStats}>
                  <div className={classes.statItem}>
                    <Text size="sm" c="dimmed">{t`Gross Sales`}</Text>
                    <Text size="xl" fw={700} c="red">
                      {formatCurrency(eventStats.totalGrossSales, 'VND')}
                    </Text>
                  </div>
                  <div className={classes.statItem}>
                    <Text size="sm" c="dimmed">{t`Net Sales`}</Text>
                    <Text size="xl" fw={700} c="blue">
                      {formatCurrency(eventStats.totalNetSales, 'VND')}
                    </Text>
                  </div>
                  <div className={classes.statItem}>
                    <Text size="sm" c="dimmed">{t`Total Discount`}</Text>
                    <Text size="xl" fw={700} c="orange">
                      {formatCurrency(eventStats.totalDiscount, 'VND')}
                    </Text>
                  </div>
                </Group>
              </div>

              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={
                    eventStats?.dailyStats.map((stat: any) => ({
                      date: formatDate(stat.date, 'MMM DD', 'Asia/Bangkok'),
                      totalSalesGross: stat.totalSalesGross,
                      totalSalesNet: stat.totalSalesNet,
                      totalDiscount: stat.totalDiscount,
                    })) || []
                  }
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#666" />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(value, 'VND')}
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value as number, 'VND')
                    }
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalSalesGross"
                    name={t`Gross Sales`}
                    stroke="#D32F2F"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#D32F2F' }}
                    activeDot={{ r: 7, fill: '#D32F2F' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalSalesNet"
                    name={t`Net Sales`}
                    stroke="#1976D2"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#1976D2' }}
                    activeDot={{ r: 7, fill: '#1976D2' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalDiscount"
                    name={t`Total Discount`}
                    stroke="#FFA000"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#FFA000' }}
                    activeDot={{ r: 7, fill: '#FFA000' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Stack>
        )}
      </PageBody>
    </div>
  );
};

export default EventDashboard;
