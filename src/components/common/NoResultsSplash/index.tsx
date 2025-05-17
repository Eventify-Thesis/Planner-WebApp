import React from 'react';
import classes from './NoResultsSplash.module.scss';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Image, Stack, Center, Text, Paper } from '@mantine/core';

interface NoResultsSplashProps {
  heading?: React.ReactNode;
  children?: React.ReactNode;
  subHeading?: React.ReactNode;
  imageHref?: string;
}

export const NoResultsSplash = ({
  heading,
  children,
  subHeading,
  imageHref = '/no-results-empty-boxes.svg',
}: NoResultsSplashProps) => {
  const [searchParams] = useSearchParams();
  const hasSearchQuery = !!searchParams.get('query');
  const { t } = useTranslation();

  return (
    <Paper p="md" shadow="xs" radius="md" className={classes.container}>
      <Stack gap="md" align="center">
        <Center>
          <Image
            alt={t`No results`}
            w={240}
            h={240}
            fit="contain"
            src={imageHref}
          />
        </Center>

        {heading && !hasSearchQuery && (
          <Text size="lg" fw={600}>{heading}</Text>
        )}

        {hasSearchQuery && (
          <Text size="lg" fw={600}>{t`No search results.`}</Text>
        )}

        {subHeading && !hasSearchQuery && (
          <Text>{subHeading}</Text>
        )}

        {children && children}
      </Stack>
    </Paper>
  );
};
