import React from 'react';
import { Card, Button, List, Space, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const EventQuestions: React.FC = () => {
  // TODO: Replace with actual API data
  const questions = [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Registration Questions</h2>
        <Button type="primary" icon={<PlusOutlined />}>
          Add Question
        </Button>
      </div>
      <Card>
        <List
          itemLayout="horizontal"
          dataSource={questions}
          renderItem={(item: any) => (
            <List.Item
              actions={[
                <Space key="actions">
                  <Button size="small">Edit</Button>
                  <Button size="small" danger>Delete</Button>
                </Space>
              ]}
            >
              <List.Item.Meta
                title={item?.question}
                description={
                  <Space>
                    <Tag color="blue">{item?.type}</Tag>
                    {item?.required && <Tag color="red">Required</Tag>}
                  </Space>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: 'No questions added yet. Click "Add Question" to create one.'
          }}
        />
      </Card>
    </div>
  );
};

export default EventQuestions;
