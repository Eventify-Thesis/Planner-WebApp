import React from 'react';
import styled from 'styled-components';
import { useAppSelector } from '@/hooks/reduxHooks';
import { BASE_COLORS } from '@/styles/themes/constants';
import { BaseButton as BaseButton } from '@/components/common/BaseButton/BaseButton';
import { Icon } from '@iconify/react';

export const CreateEventButton: React.FC = (props) => {
  const theme = useAppSelector((state) => state.theme.theme);

  return (
    <Button
      type="default"
      icon={
        <Icon
          icon="mdi:event-add"
          width={'1.4rem'}
          style={{ verticalAlign: 'middle' }}
        />
      }
      target="_blank"
      $isDark={theme === 'dark'}
      {...props}
    >
      Create event
    </Button>
  );
};

const Button = styled(BaseButton)<{ $isDark: boolean }>`
  color: ${(props) => BASE_COLORS[props.$isDark ? 'white' : 'white']};
  background: var(--primary-color);
  border-radius: 5px;
  padding-block: 0.5rem;
  height: max-content;
  display: flex;
  align-items: center;
  border: 1px solid transparent;

  & > * {
    font-family: 'Open Sans', sans-serif;
    font-weight: 600;
  }
  &:hover,
  &:active,
  &:focus {
    color: ${(props) => BASE_COLORS[props.$isDark ? 'black' : 'white']};
    background: ${(props) => BASE_COLORS[props.$isDark ? 'white' : 'black']};
  }
`;
