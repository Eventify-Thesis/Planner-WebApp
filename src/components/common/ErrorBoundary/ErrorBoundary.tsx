import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Center, Stack, Text, Button, Paper } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Center style={{ minHeight: '100vh' }}>
          <Paper withBorder p="xl" radius="md" shadow="sm" maw={500}>
            <Stack align="center" gap="md">
              <IconAlertTriangle size={48} color="var(--mantine-color-red-6)" />
              <Text size="xl" fw={600}>
                Something went wrong
              </Text>
              <Text c="dimmed" ta="center">
                We apologize for the inconvenience. The page has encountered an
                error and couldn't be loaded properly.
              </Text>
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                  window.location.reload();
                }}
              >
                Reload Page
              </Button>
            </Stack>
          </Paper>
        </Center>
      );
    }

    return this.props.children;
  }
}
