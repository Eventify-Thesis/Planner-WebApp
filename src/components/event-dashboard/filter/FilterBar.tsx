import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useResponsive } from '@/hooks/useResponsive';
import {
  TextInput,
  ActionIcon,
  SegmentedControl,
  Stack,
  Paper,
  Flex,
  rem,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import './FilterBar.css';

interface FilterBarProps {
  keyword: string;
  setKeyword: (keyword: string) => void;
  status: string;
  setStatus: (status: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  keyword,
  setKeyword,
  status,
  setStatus,
}) => {
  const { t } = useTranslation();
  const { isTablet, isDesktop } = useResponsive();
  const [localKeyword, setLocalKeyword] = useState(keyword);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalKeyword(e.target.value);
  };

  const handleSearch = () => {
    setKeyword(localKeyword);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filterOptions = [
    { label: t('eventDashboard.filter.upcoming'), value: 'UPCOMING' },
    { label: t('eventDashboard.filter.past'), value: 'PAST' },
    {
      label: t('eventDashboard.filter.waitingForApproval'),
      value: 'PENDING_APPROVAL',
    },
    { label: t('eventDashboard.filter.draft'), value: 'DRAFT' },
  ];

  const desktopLayout = (
    <Paper
      p="lg"
      radius="xl"
      shadow="md"
      style={{
        background:
          'linear-gradient(135deg, var(--tk-color-white) 0%, #fafafa 100%)',
        border: '1px solid var(--tk-color-gray-2)',
        boxShadow: '0 6px 24px rgba(71, 46, 120, 0.12)',
      }}
    >
      <Flex justify="space-between" align="center" gap="xl" wrap="nowrap">
        <TextInput
          placeholder={t('eventDashboard.inputs.searchText')}
          value={localKeyword}
          onChange={handleSearchChange}
          onKeyDown={handleKeyPress}
          rightSection={
            <ActionIcon
              size={32}
              radius="lg"
              variant="gradient"
              gradient={{ from: 'var(--tk-primary)', to: '#5a3d8a', deg: 45 }}
              onClick={handleSearch}
              style={{
                boxShadow: '0 3px 10px rgba(71, 46, 120, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow =
                  '0 5px 15px rgba(71, 46, 120, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow =
                  '0 3px 10px rgba(71, 46, 120, 0.4)';
              }}
            >
              <IconSearch size={rem(18)} />
            </ActionIcon>
          }
          styles={{
            root: {
              flexGrow: 1,
              maxWidth: rem(420),
            },
            input: {
              borderColor: 'var(--tk-color-gray-2)',
              backgroundColor: 'var(--tk-color-white)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease',
              '&:focus': {
                borderColor: 'var(--tk-primary)',
                boxShadow: '0 0 0 3px rgba(71, 46, 120, 0.15)',
                transform: 'translateY(-1px)',
              },
            },
          }}
          size="md"
          radius="lg"
        />

        <SegmentedControl
          value={status}
          onChange={setStatus}
          data={filterOptions}
          size="md"
          radius="lg"
          styles={{
            root: {
              backgroundColor: 'rgba(71, 46, 120, 0.08)',
              padding: rem(6),
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
            },
            control: {
              border: 'none',
              fontSize: rem(14),
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&[data-active]': {
                backgroundColor: 'var(--tk-primary)',
                color: 'var(--tk-color-white)',
                fontWeight: 600,
                boxShadow: '0 3px 10px rgba(71, 46, 120, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&:not([data-active])': {
                color: 'var(--tk-text)',
                backgroundColor: 'var(--tk-color-white)',
                '&:hover': {
                  backgroundColor: 'var(--tk-secondary)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                },
              },
            },
          }}
        />
      </Flex>
    </Paper>
  );

  const mobileAndTabletLayout = (
    <Paper
      p="lg"
      radius="xl"
      shadow="md"
      style={{
        background:
          'linear-gradient(135deg, var(--tk-color-white) 0%, #fafafa 100%)',
        border: '1px solid var(--tk-color-gray-2)',
        boxShadow: '0 6px 24px rgba(71, 46, 120, 0.12)',
      }}
    >
      <Stack gap="lg">
        <TextInput
          placeholder={t('eventDashboard.inputs.searchText')}
          value={localKeyword}
          onChange={handleSearchChange}
          onKeyDown={handleKeyPress}
          rightSection={
            <ActionIcon
              size={30}
              radius="lg"
              variant="gradient"
              gradient={{ from: 'var(--tk-primary)', to: '#5a3d8a', deg: 45 }}
              onClick={handleSearch}
              style={{
                boxShadow: '0 3px 10px rgba(71, 46, 120, 0.4)',
                transition: 'all 0.2s ease',
              }}
            >
              <IconSearch size={rem(16)} />
            </ActionIcon>
          }
          styles={{
            input: {
              borderColor: 'var(--tk-color-gray-2)',
              backgroundColor: 'var(--tk-color-white)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              transition: 'all 0.2s ease',
              '&:focus': {
                borderColor: 'var(--tk-primary)',
                boxShadow: '0 0 0 3px rgba(71, 46, 120, 0.15)',
                transform: 'translateY(-1px)',
              },
            },
          }}
          size="md"
          radius="lg"
        />

        <SegmentedControl
          value={status}
          onChange={setStatus}
          data={filterOptions}
          fullWidth
          size={isTablet ? 'md' : 'sm'}
          radius="lg"
          orientation={isTablet ? 'horizontal' : 'vertical'}
          styles={{
            root: {
              backgroundColor: 'rgba(71, 46, 120, 0.08)',
              padding: rem(6),
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
            },
            control: {
              border: 'none',
              fontSize: isTablet ? rem(14) : rem(12),
              height: isTablet ? rem(38) : rem(34),
              minHeight: isTablet ? rem(38) : rem(34),
              padding: isTablet
                ? `${rem(8)} ${rem(16)}`
                : `${rem(6)} ${rem(10)}`,
              transition: 'all 0.2s ease',
              '&[data-active]': {
                backgroundColor: 'var(--tk-primary)',
                color: 'var(--tk-color-white)',
                fontWeight: 600,
                boxShadow: '0 3px 10px rgba(71, 46, 120, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&:not([data-active])': {
                color: 'var(--tk-text)',
                backgroundColor: 'var(--tk-color-white)',
                '&:hover': {
                  backgroundColor: 'var(--tk-secondary)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                },
              },
            },
          }}
        />
      </Stack>
    </Paper>
  );

  return isDesktop ? desktopLayout : mobileAndTabletLayout;
};

export default FilterBar;
