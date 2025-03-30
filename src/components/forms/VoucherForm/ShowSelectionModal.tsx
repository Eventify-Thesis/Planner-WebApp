import { Empty, Input, Modal, Space, Table, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import type { TableColumnsType } from 'antd';
import { useState } from 'react';
import { IconSearch, IconCalendar, IconTicket } from '@tabler/icons-react';

interface ShowDataType {
  key: string;
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  availableTicketTypes: number;
}

interface ShowSelectionModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (selectedShow: any) => void;
  shows: any[];
  selectedShowIds: string[];
}

export const ShowSelectionModal = ({
  visible,
  onCancel,
  onSelect,
  shows,
  selectedShowIds,
}: ShowSelectionModalProps) => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');

  const columns: TableColumnsType<ShowDataType> = [
    {
      title: (
        <Space>
          <IconCalendar size={16} />
          {t('Show Date & Time')}
        </Space>
      ),
      key: 'datetime',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>{record.date}</div>
          <Tag color="blue">
            {record.startTime} - {record.endTime}
          </Tag>
        </Space>
      ),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      defaultSortOrder: 'ascend',
    },
    {
      title: (
        <Space>
          <IconTicket size={16} />
          {t('Available Tickets')}
        </Space>
      ),
      dataIndex: 'availableTicketTypes',
      key: 'availableTicketTypes',
      sorter: (a, b) => a.availableTicketTypes - b.availableTicketTypes,
      render: (tickets) => (
        <Tag color={tickets > 0 ? 'success' : 'error'}>
          {tickets} {t('tickets')}
        </Tag>
      ),
    },
  ];
  console.log('show', shows);
  const showData: ShowDataType[] =
    shows?.map((showing) => ({
      key: showing.id || '',
      id: showing.id || '',
      date: new Date(showing.startTime).toLocaleDateString(),
      startTime: new Date(showing.startTime).toLocaleTimeString(),
      endTime: new Date(showing.endTime).toLocaleTimeString(),
      availableTicketTypes: showing.ticketTypes.length || 0,
    })) || [];

  const filteredData = showData.filter(
    (show) =>
      !selectedShowIds.includes(show.id) &&
      (searchText === '' ||
        show.date.toLowerCase().includes(searchText.toLowerCase()) ||
        show.startTime.toLowerCase().includes(searchText.toLowerCase()) ||
        show.endTime.toLowerCase().includes(searchText.toLowerCase())),
  );

  const handleSelect = (record: ShowDataType) => {
    onSelect(shows.find((show) => show.id === record.id));
    onCancel();
  };

  return (
    <Modal
      title={t('Select Show')}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Input
          prefix={<IconSearch size={16} />}
          placeholder={t('Search by date or time...')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
        {filteredData.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={false}
            onRow={(record) => ({
              onClick: () => handleSelect(record),
              style: { cursor: 'pointer' },
            })}
            rowClassName="show-selection-row"
          />
        ) : (
          <Empty
            description={
              selectedShowIds.length === shows.length
                ? t('All shows have been selected')
                : t('No shows found')
            }
          />
        )}
      </Space>
    </Modal>
  );
};
