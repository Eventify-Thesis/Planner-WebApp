import React from 'react';
import { Form, Input, DatePicker, Select, Button, Card, Space } from 'antd';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const EventSettings: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    // TODO: Implement API integration
    console.log('Form values:', values);
  };

  return (
    <div>
      <h2>Event Settings</h2>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            // TODO: Load actual event data
          }}
        >
          <Form.Item
            label="Event Name"
            name="name"
            rules={[{ required: true, message: 'Please input event name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Event Date and Time"
            name="dateRange"
            rules={[{ required: true, message: 'Please select event date and time!' }]}
          >
            <RangePicker showTime />
          </Form.Item>

          <Form.Item
            label="Event Type"
            name="type"
            rules={[{ required: true, message: 'Please select event type!' }]}
          >
            <Select>
              <Select.Option value="conference">Conference</Select.Option>
              <Select.Option value="workshop">Workshop</Select.Option>
              <Select.Option value="concert">Concert</Select.Option>
              <Select.Option value="exhibition">Exhibition</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please input event description!' }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Save Changes
              </Button>
              <Button>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EventSettings;
