import { Result } from 'antd';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';

interface ErrorResultProps {
  error: AxiosError | Error | null;
}

export const ErrorResult = ({ error }: ErrorResultProps) => {
  const { t } = useTranslation();

  if (!error) return null;

  const isAxiosError = error instanceof AxiosError;
  const status = isAxiosError ? error.response?.status : 500;
  const message = isAxiosError
    ? error.response?.data?.message || error.message
    : error.message;

  return (
    <Result
      status={status === 404 ? '404' : 'error'}
      title={status}
      subTitle={message || t('common.error')}
    />
  );
};
