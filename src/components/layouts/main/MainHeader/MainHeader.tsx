import { WithChildrenProps } from '@/types/generalTypes';
import React from 'react';
import * as S from './MainHeader.styles';

interface MainHeaderProps extends WithChildrenProps {}

export const MainHeader: React.FC<MainHeaderProps> = ({ children }) => {
  return <S.Header>{children}</S.Header>;
};
