import { Card, Table, Button, Switch, Tag, Tooltip, Space } from 'antd';
import { IconTrash, IconCalendar, IconClock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { TicketTypeModel } from '@/domain/TicketTypeModel';

interface Ticket {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isFree: boolean;
}

interface ShowCardProps {
  show: any;
  onRemove: (showId: number) => void;
  onTicketSelectionChange: (
    showId: number,
    isAllTickets: boolean,
    selectedTickets: string[],
  ) => void;
}

export const ShowCard = ({
  show,
  onRemove,
  onTicketSelectionChange,
}: ShowCardProps) => {
  const { t } = useTranslation();

  const columns: TableColumnsType<Ticket> = [
    {
      title: t('Ticket Name'),
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          {name}
          {record.isFree && <Tag color="success">{t('Free')}</Tag>}
        </Space>
      ),
    },
    {
      title: t('Price'),
      dataIndex: 'price',
      key: 'price',
      render: (price, record) =>
        record.isFree ? '-' : `${price.toLocaleString()} VND`,
      width: '20%',
    },
    {
      title: t('Quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
      width: '15%',
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[]) => {
      onTicketSelectionChange(show.id, false, selectedRowKeys as string[]);
    },
    selectedRowKeys:
      show.selectedTicketIds || show.ticketTypes.map((t: Ticket) => t.id),
  };

  const handleAllTicketsChange = (checked: boolean) => {
    onTicketSelectionChange(
      show.id,
      checked,
      checked
        ? show.ticketTypes.map((ticketType: TicketTypeModel) => ticketType.id)
        : [],
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        title={
          <Space>
            <IconCalendar size={16} />
            {new Date(show.startTime).toLocaleDateString()}
            <IconClock size={16} />
            {new Date(show.startTime).toLocaleTimeString()} -{' '}
            {new Date(show.endTime).toLocaleTimeString()}
          </Space>
        }
        extra={
          <Tooltip title={t('Remove Show')}>
            <Button
              icon={<IconTrash size={16} />}
              onClick={() => onRemove(show.id)}
              type="text"
              danger
            />
          </Tooltip>
        }
        className="show-card"
      >
        <div style={{ marginBottom: 16 }}>
          <Switch
            checked={show.isAllTickets}
            onChange={handleAllTicketsChange}
            checkedChildren={t('All Tickets')}
            unCheckedChildren={t('Select Tickets')}
          />
        </div>
        <Table
          rowSelection={!show.isAllTickets ? rowSelection : undefined}
          columns={columns}
          dataSource={show.ticketTypes}
          pagination={false}
          size="small"
        />
      </Card>
    </motion.div>
  );
};
