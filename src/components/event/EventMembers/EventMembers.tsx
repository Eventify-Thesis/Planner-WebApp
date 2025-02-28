import React from 'react';
import { Table, Card, Button, Space } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';

const EventMembers: React.FC = () => {
  // TODO: Replace with actual API data
  const members = [];

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button size="small">Edit</Button>
          <Button size="small" danger>
            Remove
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h2>Event Members</h2>
        <Button type="primary" icon={<UserAddOutlined />}>
          Add Member
        </Button>
      </div>
      <Card>
        <Table columns={columns} dataSource={members} />
      </Card>
    </div>
  );
};

export default EventMembers;
