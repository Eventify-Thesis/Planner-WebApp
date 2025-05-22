import React from 'react';
import { Form } from 'antd';
import { Box, Button, Group, Text, Card, ActionIcon } from '@mantine/core';
import { IconTrash, IconSettings, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ShowModel } from '@/domain/ShowModel';
import { TicketTypeModel } from '@/domain/TicketTypeModel';
import classes from './TicketSection.module.css';

interface TicketSectionProps {
  show: ShowModel;
  showIndex: number;
  onAddTicket: () => void;
  onEditTicket: (showIndex: number, ticketType: TicketTypeModel) => void;
  onShowUpdate: (updatedShow: ShowModel) => void;
}

export const TicketSection: React.FC<TicketSectionProps> = ({
  show,
  showIndex,
  onAddTicket,
  onEditTicket,
  onShowUpdate,
}) => {
  const { t } = useTranslation();

  const handleDeleteTicket = (ticketIndex: number) => {
    const updatedTickets = [...show.ticketTypes];
    updatedTickets.splice(ticketIndex, 1);
    onShowUpdate({ ...show, ticketTypes: updatedTickets });
  };

  console.log(show.ticketTypes);

  return (
    <Form.Item
      name={['shows', showIndex, 'ticketTypes']}
      initialValue={show.ticketTypes}
      trigger="onChange"
      validateTrigger={['onChange']}
    >
      <Box className={classes.ticketContainer}>
        {show.ticketTypes.map((ticketType, ticketIndex) => (
          <Card
            key={ticketType.id || ticketIndex.toString()}
            className={classes.ticketCard}
            shadow="sm"
            padding={0}
          >
            <Box className={classes.ticketHeader}>
              <Text className={classes.ticketTitle}>{ticketType.name}</Text>
              <Group gap="xs">
                <ActionIcon
                  variant="transparent"
                  color="white"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(ticketType);
                    onEditTicket(showIndex, ticketType);
                  }}
                >
                  <IconSettings size={16} />
                </ActionIcon>
                <ActionIcon
                  variant="transparent"
                  color="red"
                  onClick={() => handleDeleteTicket(ticketIndex)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            </Box>
            <Box className={classes.ticketContent}>
              <Text
                className={`${classes.ticketPrice} ${
                  ticketType.isFree ? classes.ticketFree : ''
                }`}
              >
                {ticketType.isFree
                  ? 'Free'
                  : `${new Intl.NumberFormat('vi-VN').format(
                      Number(ticketType.price),
                    )} đ`}
              </Text>
            </Box>
          </Card>
        ))}
        <Box className={classes.buttonContainer}>
          <Button
            variant="subtle"
            onClick={onAddTicket}
            className={classes.actionButton}
            leftSection={<IconPlus size={18} />}
          >
            {t('show_and_ticket.add_ticket')}
          </Button>
        </Box>
      </Box>
    </Form.Item>
  );
};
