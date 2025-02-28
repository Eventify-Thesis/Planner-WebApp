import React from 'react';
import { Card, Input, Button, List } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const EventCheckin: React.FC = () => {
  // TODO: Replace with actual API integration
  const attendees = [];

  return (
    <div>
      <h2>Check-in</h2>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Search by ticket ID or attendee name"
            enterButton={<Button type="primary" icon={<SearchOutlined />}>Search</Button>}
            size="large"
          />
        </div>
        <List
          itemLayout="horizontal"
          dataSource={attendees}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                <Button type="primary" key="checkin">
                  Check-in
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={item?.name}
                description={`Ticket ID: ${item?.ticketId}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default EventCheckin;
