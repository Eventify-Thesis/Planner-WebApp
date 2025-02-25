import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { BaseSpin } from '../BaseSpin/BaseSpin';
import * as S from './BaseJobList.styles';

export interface BaseJobListProps {
  next: () => void;
  hasMore: boolean;
  children: React.ReactNode[];
  target?: string;
}

export const BaseJobList: React.FC<BaseJobListProps> = ({
  next,
  hasMore,
  target = 'main-content',
  children,
}) => {
  return (
    <InfiniteScroll
      dataLength={children.length}
      next={next}
      hasMore={hasMore}
      loader={
        <S.SpinnerWrapper>
          <BaseSpin size="large" />
        </S.SpinnerWrapper>
      }
      scrollableTarget={target}
    >
      <S.JobsWrapper>{children}</S.JobsWrapper>
    </InfiniteScroll>
  );
};
