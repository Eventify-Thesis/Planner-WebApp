import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Modal, Stack, Text, Button, Center } from '@mantine/core';
import { IconLock, IconAlertTriangle } from '@tabler/icons-react';
import { showError } from '@/utils/notifications';
import { setGlobalErrorHandler } from '@/api/http.api';

export const GlobalErrorHandler: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [permissionError, setPermissionError] = useState(false);
  const [tokenExpiredError, setTokenExpiredError] = useState(false);

  useEffect(() => {
    const handleGlobalError = (status: number, messageKey: string) => {
      switch (status) {
        case 401:
          // Token expired - show modal and redirect to login
          setTokenExpiredError(true);
          break;

        case 403:
          // Insufficient permissions - show modal
          setPermissionError(true);
          break;

        default:
          showError(t('common.error'));
      }
    };

    // Set the global error handler
    setGlobalErrorHandler(handleGlobalError);

    // Cleanup
    return () => {
      setGlobalErrorHandler(() => {});
    };
  }, [t]);

  const handleTokenExpiredClose = () => {
    setTokenExpiredError(false);
    navigate('/auth/login', { replace: true });
  };

  const handlePermissionErrorClose = () => {
    setPermissionError(false);
  };

  return (
    <>
      {/* Token Expired Modal */}
      <Modal
        opened={tokenExpiredError}
        onClose={handleTokenExpiredClose}
        title=""
        centered
        size="md"
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <Stack align="center" gap="lg" py="md">
          <IconAlertTriangle size={64} color="var(--mantine-color-orange-6)" />
          <Stack align="center" gap="xs">
            <Text size="xl" fw={600}>
              {t('common.unauthorized')}
            </Text>
            <Text c="dimmed" ta="center">
              For your security, you need to log in again to continue.
            </Text>
          </Stack>
          <Button onClick={handleTokenExpiredClose} size="md" fullWidth>
            Go to Login
          </Button>
        </Stack>
      </Modal>

      {/* Permission Denied Modal */}
      <Modal
        opened={permissionError}
        onClose={handlePermissionErrorClose}
        title=""
        centered
        size="md"
      >
        <Stack align="center" gap="lg" py="md">
          <IconLock size={64} color="var(--mantine-color-red-6)" />
          <Stack align="center" gap="xs">
            <Text size="xl" fw={600}>
              Access Denied
            </Text>
            <Text c="dimmed" ta="center">
              {t('common.forbidden')}
            </Text>
            <Text c="dimmed" ta="center" size="sm">
              Please contact your administrator if you believe this is an error.
            </Text>
          </Stack>
          <Button onClick={handlePermissionErrorClose} size="md" fullWidth>
            Understood
          </Button>
        </Stack>
      </Modal>
    </>
  );
};
