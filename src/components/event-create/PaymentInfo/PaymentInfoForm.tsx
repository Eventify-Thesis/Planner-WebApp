import { Form, Input } from 'antd';

export const PaymentInfoForm = ({ formRef, onValidate }: any) => {
  return (
    <Form layout="vertical" ref={formRef}>
      <Form.Item
        label="Bank Account Number"
        name="accountNumber"
        rules={[{ required: true, message: 'Please enter account number' }]}
      >
        <Input placeholder="Enter bank account number" />
      </Form.Item>

      <Form.Item
        label="Routing Number"
        name="routingNumber"
        rules={[{ required: true, message: 'Please enter routing number' }]}
      >
        <Input placeholder="Enter routing number" />
      </Form.Item>
    </Form>
  );
};
