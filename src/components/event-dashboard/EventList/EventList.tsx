import { EventListAllResponse } from '@/dto/event-doc.dto';
import { EventCard } from './EventCard';
import { Box, Center, Text, Stack } from '@mantine/core';
import { createStyles } from '@mantine/styles';
import { IconInbox } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface EventListProps {
  events: EventListAllResponse[];
}

const useStyles = createStyles((theme: any) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    minHeight: 300,
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    minHeight: 300,
    width: '100%',
    color: theme.colors.gray[6],
  },
  emptyIcon: {
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.fontSizes.md,
  },
}));

const EventList: React.FC<EventListProps> = ({ events }) => {
  const { classes } = useStyles();
  const { t } = useTranslation();

  return (
    <Box className={classes.container}>
      {!events || events.length === 0 ? (
        <Center className={classes.emptyContainer}>
          <IconInbox size={48} className={classes.emptyIcon} stroke={1.5} />
          <Text className={classes.emptyText}>
            {t('eventDashboard.noEvents')}
          </Text>
        </Center>
      ) : (
        <Stack gap="md" w="100%">
          {events.map((event, index) => (
            <EventCard key={index} {...event} />
          ))}
        </Stack>
      )}
    </Box>
  );
};
export default EventList;
