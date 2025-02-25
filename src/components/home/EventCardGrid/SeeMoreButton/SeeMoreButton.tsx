import React from 'react';
import * as S from './SeeMoreButton.styles';

export const SeeMoreButton: React.FC<S.ViewAllProps> = ({ buttonName }) => {
  return (
    <S.SeeMoreButton>{buttonName}</S.SeeMoreButton>
  );
};
