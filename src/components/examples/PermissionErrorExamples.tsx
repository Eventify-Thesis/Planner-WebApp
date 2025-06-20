import React from 'react';
import { Stack, Title, Divider, Text, Group, Button } from '@mantine/core';
import { PermissionGuard } from '@/components/common/PermissionGuard/PermissionGuard';

export const PermissionErrorExamples: React.FC = () => {
  return (
    <Stack gap="xl" p="md">
      <Title order={2}>Permission Error Display Examples</Title>

      <Stack gap="md">
        <Title order={3}>1. Alert Variant (Subtle)</Title>
        <Text size="sm" c="dimmed">
          Good for inline warnings within forms or content areas
        </Text>
        <PermissionGuard
          hasPermission={false}
          variant="alert"
          message="You need administrator privileges to access this feature"
        >
          <Text>This content is protected</Text>
        </PermissionGuard>
      </Stack>

      <Divider />

      <Stack gap="md">
        <Title order={3}>2. Inline Variant (Compact)</Title>
        <Text size="sm" c="dimmed">
          Good for replacing content sections that require permissions
        </Text>
        <PermissionGuard
          hasPermission={false}
          variant="inline"
          message="Manager access required to view financial data"
          redirectTo="/events"
        >
          <Text>Financial dashboard content would be here</Text>
        </PermissionGuard>
      </Stack>

      <Divider />

      <Stack gap="md">
        <Title order={3}>3. Modal Variant (Prominent)</Title>
        <Text size="sm" c="dimmed">
          Good for full page or major section protection
        </Text>
        <PermissionGuard
          hasPermission={false}
          variant="modal"
          message="Owner privileges required to access this section"
          redirectTo="/events"
        >
          <Text>Protected page content would be here</Text>
        </PermissionGuard>
      </Stack>

      <Divider />

      <Stack gap="md">
        <Title order={3}>Usage Examples</Title>
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Alert Variant:
          </Text>
          <Text size="xs" c="dimmed" ff="monospace">
            {`<PermissionGuard hasPermission={false} variant="alert" />`}
          </Text>

          <Text size="sm" fw={500}>
            Inline Variant:
          </Text>
          <Text size="xs" c="dimmed" ff="monospace">
            {`<PermissionGuard hasPermission={false} variant="inline" redirectTo="/events" />`}
          </Text>

          <Text size="sm" fw={500}>
            Modal Variant (default):
          </Text>
          <Text size="xs" c="dimmed" ff="monospace">
            {`<PermissionGuard hasPermission={false} message="Custom message" />`}
          </Text>
        </Stack>
      </Stack>
    </Stack>
  );
};
