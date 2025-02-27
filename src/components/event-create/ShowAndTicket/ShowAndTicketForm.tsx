import { Button, Card, DatePicker, Form, Input, InputNumber } from 'antd';
import { useState } from 'react';

export const ShowAndTicketForm = ({ formRef, onValidate }: any) => {
  const [tickets, setTickets] = useState([{ type: '', price: 0, quantity: 0 }]);

  const addTicketType = () => {
    setTickets([...tickets, { type: '', price: 0, quantity: 0 }]);
  };

  return (
    <Form layout="vertical" ref={formRef}>
      <Form.Item
        label="Venue Name"
        name="venue"
        rules={[{ required: true, message: 'Please enter venue name' }]}
      >
        <Input placeholder="Enter venue name" />
      </Form.Item>

      <Form.Item
        label="Event Date & Time"
        name="eventDateTime"
        rules={[{ required: true, message: 'Please select date and time' }]}
      >
        <DatePicker showTime format="YYYY-MM-DD HH:mm" />
      </Form.Item>

      <Card title="Ticket Types" style={{ marginTop: 16 }}>
        {tickets.map((ticket, index) => (
          <div
            key={index}
            style={{ display: 'flex', gap: 16, marginBottom: 16 }}
          >
            <Form.Item
              label="Ticket Type"
              name={['tickets', index, 'type']}
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input placeholder="e.g., VIP, General Admission" />
            </Form.Item>
            <Form.Item
              label="Price"
              name={['tickets', index, 'price']}
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={0} placeholder="$" />
            </Form.Item>
            <Form.Item
              label="Quantity"
              name={['tickets', index, 'quantity']}
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={1} placeholder="Qty" />
            </Form.Item>
          </div>
        ))}
        <Button type="dashed" onClick={addTicketType}>
          Add Ticket Type
        </Button>
      </Card>
    </Form>
  );
};
