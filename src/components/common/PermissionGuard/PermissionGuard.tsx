import React from 'react';
import { Center, Stack, Text, Button, Paper, Box, Alert } from '@mantine/core';
import { IconLock, IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface PermissionGuardProps {
  children: React.ReactNode;
  hasPermission: boolean;
  fallback?: React.ReactNode;
  redirectTo?: string;
  variant?: 'modal' | 'inline' | 'alert';
  message?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  hasPermission,
  fallback,
  redirectTo,
  variant = 'modal',
  message,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Alert variant - subtle inline warning
  if (variant === 'alert') {
    return (
      <Alert
        icon={<IconLock size={16} />}
        title="Access Restricted"
        color="red"
        variant="light"
        radius="md"
      >
        <Text size="sm">{message || t('common.forbidden')}</Text>
        {redirectTo && (
          <Button
            variant="light"
            color="red"
            size="xs"
            mt="xs"
            onClick={() => navigate(redirectTo)}
          >
            Go Back
          </Button>
        )}
      </Alert>
    );
  }

  // Inline variant - compact in-content display
  if (variant === 'inline') {
    return (
      <Box py="xl">
        <Stack align="center" gap="md">
          <IconLock size={32} color="var(--mantine-color-red-6)" />
          <Stack align="center" gap="xs">
            <Text size="lg" fw={500} c="red">
              Access Denied
            </Text>
            <Text c="dimmed" ta="center" size="sm">
              {message || t('common.forbidden')}
            </Text>
          </Stack>
          {redirectTo && (
            <Button
              size="sm"
              variant="light"
              onClick={() => navigate(redirectTo)}
            >
              Go Back
            </Button>
          )}
        </Stack>
      </Box>
    );
  }

  // Modal variant - prominent centered display (default)
  return (
    <Center style={{ minHeight: '50vh' }}>
      <Paper withBorder p="xl" radius="lg" shadow="md" maw={500}>
        <Stack align="center" gap="lg">
          <Box
            style={{
              padding: '16px',
              borderRadius: '50%',
              backgroundColor: 'var(--mantine-color-red-0)',
            }}
          >
            <IconLock size={48} color="var(--mantine-color-red-6)" />
          </Box>
          <Stack align="center" gap="sm">
            <Text size="xl" fw={600} c="red">
              Access Denied
            </Text>
            <Text c="dimmed" ta="center">
              {message || t('common.forbidden')}
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Please contact your administrator if you believe this is an error.
            </Text>
          </Stack>
          {redirectTo && (
            <Button onClick={() => navigate(redirectTo)}>Go Back</Button>
          )}
        </Stack>
      </Paper>
    </Center>
  );
};
