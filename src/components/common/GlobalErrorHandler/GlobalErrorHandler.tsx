import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Modal, Stack, Text, Button, Center } from '@mantine/core';
import { IconLock, IconAlertTriangle } from '@tabler/icons-react';
import { showError } from '@/utils/notifications';
import { setGlobalErrorHandler } from '@/api/http.api';
import { getToken } from '@/services/tokenManager';

export const GlobalErrorHandler: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const [permissionError, setPermissionError] = useState(false);
  const [tokenExpiredError, setTokenExpiredError] = useState(false);

  useEffect(() => {
    const handleGlobalError = (status: number, messageKey: string) => {
      switch (status) {
        case 401:
          // Only show "session expired" modal if user is actually signed in and has a token
          // This prevents the modal from showing during initial load when user isn't authenticated yet
          const currentToken = getToken();
          const shouldShowModal = isLoaded && isSignedIn && currentToken;

          if (shouldShowModal) {
            setTokenExpiredError(true);
          }
          // Ignore 401 errors when user is not properly authenticated yet
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
  }, [t, isSignedIn, isLoaded]);

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
