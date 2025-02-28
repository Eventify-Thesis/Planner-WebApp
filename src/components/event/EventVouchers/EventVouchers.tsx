import React from 'react';
import { Card, Button, Table, Tag, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const EventVouchers: React.FC = () => {
  // TODO: Replace with actual API data
  const vouchers = [];

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      render: (discount: number, record: any) => 
        `${discount}${record.discountType === 'percentage' ? '%' : '$'} off`,
    },
    {
      title: 'Usage',
      dataIndex: 'usage',
      key: 'usage',
      render: (used: number, record: any) => `${used}/${record.limit}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Expiry',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button size="small">Edit</Button>
          <Button size="small" danger>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Vouchers</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          Create Voucher
        </Button>
      </div>
      <Card>
        <Table columns={columns} dataSource={vouchers} />
      </Card>
    </div>
  );
};

export default EventVouchers;
