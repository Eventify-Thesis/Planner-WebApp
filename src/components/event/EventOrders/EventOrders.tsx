import React from 'react';
import { Table, Card } from 'antd';

const EventOrders: React.FC = () => {
  // TODO: Replace with actual API data
  const orders = [];

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Ticket Type',
      dataIndex: 'ticket',
      key: 'ticket',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  return (
    <div>
      <h2>Orders</h2>
      <Card>
        <Table columns={columns} dataSource={orders} />
      </Card>
    </div>
  );
};

export default EventOrders;
