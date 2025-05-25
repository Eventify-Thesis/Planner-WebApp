import { EventCardActions } from './EventCardActions';
import { EventStatus } from '@/constants/enums/event';
import { Card, Image, Text, Flex, Box, Anchor, Group } from '@mantine/core';
import { createStyles } from '@mantine/styles';
import {
  IconCalendar,
  IconMapPin,
  IconClock,
  IconUser,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useLanguage } from '@/hooks/useLanguage';

interface EventCardProps {
  id: string;
  addressFull: string;
  eventBannerUrl: string;
  eventName: string;
  url: string;
  startTime: Date;
  status: EventStatus;
  venueName: string;
  endTime?: string;
  role?: string;
}

// @ts-ignore

const useStyles = createStyles((theme: any) => ({
  card: {
    backgroundColor: theme.colors.dark[7],
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    width: '100%',
    marginBottom: theme.spacing.xs,
    border: `1px solid ${theme.colors.dark[5]}`,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    position: 'relative',

    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
    },

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '5px',
      height: '100%',
      // background: 'linear-gradient(to bottom, #4263EB, #0ACF83)',
      borderTopLeftRadius: theme.radius.md,
      borderBottomLeftRadius: theme.radius.md,
    },
  },
  cardContent: {
    display: 'flex',
    padding: theme.spacing.sm,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.dark[8],
    width: '100%',
    flexWrap: 'wrap',
    borderBottom: `1px solid ${theme.colors.dark[6]}`,
    position: 'relative',
    zIndex: 1,
    minHeight: '140px',

    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      // background: 'linear-gradient(135deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%)',
      pointerEvents: 'none',
      zIndex: -1,
    },

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      flexDirection: 'column',
    },
  },
  image: {
    width: '200px !important',
    height: '100px !important',
    borderRadius: '5px !important',
    objectFit: 'cover !important',
    border: `2px solid rgb(66, 235, 100) !important`,
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
    transition: 'transform 0.3s ease-in-out',

    '&:hover': {
      transform: 'scale(1.02)',
    },

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      width: '160px !important',
      height: '100px !important',
    },
  },
  details: {
    flex: 1,
    minWidth: 240,
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
    gap: theme.spacing.xs,
  },
  title: {
    fontSize: '20px !important',
    fontWeight: 700,
    color: 'white !important',
    WebkitTextFillColor: 'white !important',
    marginBottom: '16px !important',
    textDecoration: 'none',
    position: 'relative',
    display: 'inline-block',

    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -2,
      left: 0,
      width: 0,
      height: '2px',
      background: 'linear-gradient(to right, #4263EB, #0ACF83)',
      transition: 'width 0.3s ease',
    },

    '&:hover': {
      textDecoration: 'none',

      '&::after': {
        width: '100%',
      },
    },
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dateText: {
    fontSize: theme.fontSizes.sm,
    color: 'red !important',
    WebkitBackgroundClip: 'unset',
    WebkitTextFillColor: 'var(--primary-color) !important',
    fontWeight: 600,
    letterSpacing: '0.3px',
  },
  venueName: {
    fontSize: theme.fontSizes.xs,
    color: 'white',
    WebkitBackgroundClip: 'unset',
    WebkitTextFillColor: 'var(--primary-color) !important',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '0.3px',
  },
  locationText: {
    fontSize: theme.fontSizes.xs,
    color: 'white',
    lineHeight: 1.3,
  },
  actionsBar: {
    backgroundColor: theme.colors.dark[7],
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderTop: `1px solid ${theme.colors.dark[6]}`,
    position: 'relative',
    overflow: 'hidden',

    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      // background: 'linear-gradient(to right, rgba(66, 99, 235, 0.05), rgba(10, 207, 131, 0.05))',
      pointerEvents: 'none',
    },
  },

  statusBadge: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    padding: '20px',
    fontSize: theme.fontSizes.xs,
    fontWeight: 600,
    textTransform: 'uppercase',
    backgroundColor: 'rgba(10, 207, 131, 0.2)',
    color: '#0ACF83',
    border: '1px solid rgba(10, 207, 131, 0.3)',
    backdropFilter: 'blur(4px)',
    zIndex: 2,

    [theme.fn.smallerThan('md')]: {
      display: 'none',
      visibility: 'hidden',
      opacity: 0,
      pointerEvents: 'none',
    },
  },

  rightSection: {
    position: 'absolute',
    top: theme.spacing.xs,
    right: '120px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.dark[7],
    borderRadius: theme.radius.md,
    border: `1px solid ${theme.colors.dark[5]}`,
    zIndex: 2,

    [theme.fn.smallerThan('md')]: {
      display: 'none',
      visibility: 'hidden',
      opacity: 0,
      pointerEvents: 'none',
    },
  },

  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.dark[6],
    borderRadius: theme.radius.sm,
  },

  statValue: {
    fontSize: theme.fontSizes.sm,
    fontWeight: '700 !important',
    WebkitTextFillColor: 'white',
  },
}));

export const EventCard = ({
  id,
  addressFull,
  eventBannerUrl,
  eventName,
  url,
  startTime,
  endTime,
  role,
  status,
  venueName,
}: EventCardProps) => {
  const { classes } = useStyles();
  const { language } = useLanguage();
  const locale = language === 'en' ? 'en' : 'vi';
  const eventUrl = `${import.meta.env.VITE_USER_BASE_URL}/${url}-${id}`;

  // Calculate duration in days
  const getDuration = () => {
    if (!startTime || !endTime) return 'N/A';
    const start = dayjs(startTime);
    const end = dayjs(endTime);
    const days = end.diff(start, 'day');
    return `${days} days`;
  };

  // Function to determine badge styling based on event status
  const getStatusBadgeStyle = () => {
    switch (status) {
      case EventStatus.UPCOMING:
        return {
          backgroundColor: 'rgba(10, 207, 131, 0.2)',
          color: '#0ACF83',
          border: '1px solid rgba(10, 207, 131, 0.3)',
        };
      case EventStatus.PUBLISHED:
        return {
          backgroundColor: 'rgba(102, 102, 155, 0.2)',
          color: '#8888DD',
          border: '1px solid rgba(102, 102, 155, 0.3)',
        };
      case EventStatus.PENDING_APPROVAL:
        return {
          backgroundColor: 'rgba(255, 171, 0, 0.2)',
          color: '#FFAB00',
          border: '1px solid rgba(255, 171, 0, 0.3)',
        };
      case EventStatus.DRAFT:
        return {
          backgroundColor: 'rgba(235, 87, 87, 0.2)',
          color: '#EB5757',
          border: '1px solid rgba(235, 87, 87, 0.3)',
        };
      default:
        return {
          backgroundColor: 'rgba(66, 99, 235, 0.2)',
          color: '#4263EB',
          border: '1px solid rgba(66, 99, 235, 0.3)',
        };
    }
  };

  // Get status text based on status enum
  const getStatusText = () => {
    switch (status) {
      case EventStatus.UPCOMING:
        return 'Upcoming';
      case EventStatus.PUBLISHED:
        return 'Published';
      case EventStatus.PENDING_APPROVAL:
        return 'Pending';
      case EventStatus.DRAFT:
        return 'Draft';
      default:
        return 'Unknown';
    }
  };

  const badgeStyle = getStatusBadgeStyle();

  return (
    <Card className={classes.card} radius="md" withBorder p={0}>
      <Box className={classes.rightSection}>
        <Box className={classes.statItem}>
          <IconClock size={16} stroke={1.5} color="#4263EB" />
          <Text className={classes.statValue}>{getDuration()}</Text>
        </Box>

        <Box className={classes.statItem}>
          <IconUser size={16} stroke={1.5} color="#0ACF83" />
          <Text className={classes.statValue}>{role || 'N/A'}</Text>
        </Box>
      </Box>

      <Text
        className={classes.statusBadge}
        style={{
          ...badgeStyle,
          padding: '8px',
        }}
      >
        {getStatusText()}
      </Text>
      <Box className={classes.cardContent}>
        <Image
          src={eventBannerUrl}
          alt={eventName}
          className={classes.image}
          fallbackSrc="https://placehold.co/600x400?text=Event+Image"
          style={{
            width: '200px',
            height: '100px',
            border: '1px solid rgb(66, 235, 100)',
          }}
        />
        <Box className={classes.details}>
          <Anchor
            href={eventUrl}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = eventUrl;
            }}
            target="_blank"
            className={classes.title}
            underline="never"
            color="white"
            style={{ fontSize: '20px', fontWeight: 'bold' }}
          >
            {eventName}
          </Anchor>

          <Flex direction="column" gap="xs">
            <Flex align="center" gap="xs" className={classes.infoItem}>
              <IconCalendar size={20} stroke={1.5} color="white" />
              <Text className={classes.dateText} color="white">
                {startTime
                  ? dayjs(startTime).locale(locale).format('LLLL')
                  : 'TBD'}
              </Text>
            </Flex>

            {venueName && (
              <Flex align="start" gap="xs" className={classes.infoItem}>
                <IconMapPin size={20} stroke={1.5} color="white" />
                <Box>
                  {addressFull && (
                    <Text className={classes.locationText} color="white">
                      {addressFull}
                    </Text>
                  )}
                  <Text className={classes.venueName} color="white">
                    {venueName}
                  </Text>
                </Box>
              </Flex>
            )}
          </Flex>
        </Box>
      </Box>

      <Box className={classes.actionsBar}>
        <EventCardActions id={id} eventStatus={status} />
      </Box>
    </Card>
  );
};
