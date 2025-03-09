import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';

export const confirmationDialog = (
  message: string,
  onConfirm: () => void,
  labels?: { confirm: string; cancel: string },
) => {
  const { t } = useTranslation();
  modals.openConfirmModal({
    title: message,
    labels: labels || { confirm: t('confirm'), cancel: t('cancel') },
    onConfirm: () => onConfirm(),
  });
};
