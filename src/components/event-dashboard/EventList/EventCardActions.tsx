import { useTranslation } from 'react-i18next';
import { useResponsive } from '@/hooks/useResponsive';
import { useNavigate } from 'react-router-dom';
import { EventStatus } from '@/constants/enums/event';
import { Group, UnstyledButton, Text, Tooltip, Box } from '@mantine/core';
import { createStyles } from '@mantine/styles';
import { IconLayoutDashboard, IconUsers, IconShoppingCart, IconArmchair, IconSettings } from '@tabler/icons-react';

const useStyles = createStyles((theme: any) => ({
  actionButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.xs,
    padding: `${theme.spacing.sm} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    transition: 'all 0.2s ease',
    flex: 1,
    position: 'relative',
    
    '&:hover': {
      backgroundColor: 'rgba(66, 99, 235, 0.1)',
      transform: 'translateY(-2px)',
    },
    
    '&:active': {
      transform: 'translateY(0px)',
    },
  },
  
  actionIcon: {
    color: theme.white,
    opacity: 0.9,
    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    
    '&:hover': {
      opacity: 1,
    },
  },
  
  actionText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.white,
    fontWeight: 600,
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
    letterSpacing: '0.4px',
  },
  
  actionsContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-around',
  },
  
  divider: {
    width: '1px',
    alignSelf: 'stretch',
    margin: '8px 0',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
}));

export const EventCardActions = ({
  id,
  eventStatus,
}: {
  id: string;
  eventStatus: EventStatus;
}) => {
  const { classes } = useStyles();
  const { t } = useTranslation();
  const { isDesktop } = useResponsive();
  const navigate = useNavigate();
  
  const iconSize = 18;
  const iconStroke = 1.5;

  const actions = [
    {
      icon: <IconLayoutDashboard size={iconSize} stroke={iconStroke} />,
      label: t('eventDashboard.overview'),
      onClick: () => navigate(`/events/${id}/dashboard`)
    },
    {
      icon: <IconUsers size={iconSize} stroke={iconStroke} />,
      label: t('eventDashboard.members'),
      onClick: () => navigate(`/events/${id}/members`)
    },
    {
      icon: <IconShoppingCart size={iconSize} stroke={iconStroke} />,
      label: t('eventDashboard.orders'),
      onClick: () => navigate(`/events/${id}/orders`)
    },
    {
      icon: <IconArmchair size={iconSize} stroke={iconStroke} />,
      label: t('eventDashboard.seating'),
      onClick: () => navigate(`/events/${id}/seatmap/new`)
    },
    {
      icon: <IconSettings size={iconSize} stroke={iconStroke} />,
      label: t('eventDashboard.edit'),
      onClick: () => {
        if (eventStatus === EventStatus.DRAFT) {
          navigate(`/create-event/${id}?step=info`);
        } else {
          navigate(`/events/${id}/edit-event`);
        }
      }
    }
  ];

  return (
    <Group className={classes.actionsContainer} gap={0} wrap="nowrap">
      {actions.map((action, index) => (
        <Box key={index} style={{ display: 'flex', flex: 1, position: 'relative' }}>
          <Tooltip label={action.label} disabled={isDesktop}>
            <UnstyledButton
              className={classes.actionButton}
              onClick={action.onClick}
            >
              <Box className={classes.actionIcon}>{action.icon}</Box>
              {isDesktop && (
                <Text className={classes.actionText} style={
                  {
                    color: 'white',
                  }
                }>{action.label}</Text>
              )}
            </UnstyledButton>
          </Tooltip>
          {index < actions.length - 1 && <Box className={classes.divider} />}
        </Box>
      ))}
    </Group>
  );
};


