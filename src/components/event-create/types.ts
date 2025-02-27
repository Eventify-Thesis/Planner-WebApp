import { FormInstance } from 'antd';

export interface FormStepProps {
  formRef: React.RefObject<FormInstance>;
  onValidate: () => void;
}
