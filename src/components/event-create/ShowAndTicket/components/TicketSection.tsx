import React from 'react';
import { Button, Space, Form } from 'antd';
import {
  DeleteOutlined,
  PlusCircleFilled,
  SettingOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ShowingModel } from '@/domain/ShowModel';
import { StyledTicketContainer, TicketCard } from '../ShowAndTicketForm.styles';
import { FONT_SIZE } from '@/styles/themes/constants';

interface TicketSectionProps {
  show: ShowingModel;
  showIndex: number;
  onAddTicket: () => void;
  onEditTicket: (ticketTypeId: string) => void;
  onShowUpdate: (updatedShow: ShowingModel) => void;
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

  return (
    <Form.Item
      name={['shows', showIndex, 'ticketTypes']}
      initialValue={show.ticketTypes}
      trigger="onChange"
      validateTrigger={['onChange']}
    >
      <StyledTicketContainer>
        {show.ticketTypes.map((ticketType, ticketIndex) => (
          <TicketCard
            key={ticketType.id || ticketIndex}
            size="small"
            title={ticketType.name}
            extra={
              <Space>
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  onClick={() => onEditTicket(ticketType.id)}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteTicket(ticketIndex)}
                />
              </Space>
            }
          >
            <p>{ticketType.isFree ? 'Free' : `$${ticketType.price}`}</p>
          </TicketCard>
        ))}
        <div
          style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
        >
          <Button
            type="text"
            onClick={onAddTicket}
            style={{
              color: 'var(--primary-color)',
              paddingLeft: 0,
              fontWeight: 'bold',
              fontSize: FONT_SIZE.md,
            }}
            icon={<PlusCircleFilled />}
          >
            {t('show_and_ticket.add_ticket')}
          </Button>
        </div>
      </StyledTicketContainer>
    </Form.Item>
  );
};
