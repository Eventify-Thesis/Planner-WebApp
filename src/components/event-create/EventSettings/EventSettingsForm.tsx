import { Form, InputNumber, Select } from 'antd';

export const EventSettingsForm = ({ formRef, onValidate }: any) => {
  return (
    <Form layout="vertical" ref={formRef}>
      <Form.Item
        label="Maximum Attendees"
        name="maxAttendees"
        rules={[{ required: true, message: 'Please enter maximum attendees' }]}
      >
        <InputNumber min={1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        label="Age Restriction"
        name="ageRestriction"
        rules={[{ required: true, message: 'Please select age restriction' }]}
      >
        <Select placeholder="Select age restriction">
          <Select.Option value="all">All Ages</Select.Option>
          <Select.Option value="18+">18+</Select.Option>
          <Select.Option value="21+">21+</Select.Option>
        </Select>
      </Form.Item>
    </Form>
  );
};
