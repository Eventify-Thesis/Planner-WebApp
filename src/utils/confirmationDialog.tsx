import { modals } from '@mantine/modals';

export const confirmationDialog = (
  message: string,
  onConfirm: () => void,
  labels: { confirm: string; cancel: string },
) => {
  modals.openConfirmModal({
    title: message,
    labels: labels,
    onConfirm: () => onConfirm(),
  });
};
