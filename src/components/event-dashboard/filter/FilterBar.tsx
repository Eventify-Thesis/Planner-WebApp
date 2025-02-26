import React, { useState } from 'react';
import * as S from './FilterBar.styles';
import { useTranslation } from 'react-i18next';
import { useResponsive } from '@/hooks/useResponsive';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import { SearchInput } from '@/components/common/inputs/SearchInput/SearchInput';
import { BaseCol } from '@/components/common/BaseCol/BaseCol';
import { RadioChangeEvent } from 'antd';

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

  const handleFilterClick = (e: RadioChangeEvent) => {
    setStatus(e.target.value);
  };

  const desktopLayout = (
    <BaseRow align="middle" gutter={[10, 10]} style={{ width: '100%' }}>
      <BaseCol
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <S.InputsWrapper>
          <SearchInput
            placeholder={t('eventDashboard.inputs.searchText')}
            enterButton="Search"
            size="middle"
            value={localKeyword}
            onChange={handleSearchChange}
            onSearch={() => setKeyword(localKeyword)}
          />
        </S.InputsWrapper>

        <S.RadioGroup value={status} onChange={handleFilterClick}>
          <S.RadioButton value="UPCOMING">
            {t('eventDashboard.filter.upcoming')}
          </S.RadioButton>
          <S.RadioButton value="PAST">
            {t('eventDashboard.filter.past')}
          </S.RadioButton>
          <S.RadioButton value="PENDING_APPROVAL">
            {t('eventDashboard.filter.waitingForApproval')}
          </S.RadioButton>
          <S.RadioButton value="DRAFT">
            {t('eventDashboard.filter.draft')}
          </S.RadioButton>
        </S.RadioGroup>
      </BaseCol>
    </BaseRow>
  );

  const mobileAndTabletLayout = (
    <BaseRow align="middle" gutter={[10, 10]} style={{ width: '100%' }}>
      <BaseCol span={24}>
        <S.InputsWrapper>
          <SearchInput
            placeholder={t('eventDashboard.inputs.searchText')}
            enterButton="Search"
            size="middle"
            value={localKeyword}
            onChange={handleSearchChange}
            onSearch={() => setKeyword(localKeyword)}
          />
        </S.InputsWrapper>
      </BaseCol>
      <BaseCol span={24}>
        <S.RadioGroup
          value={status}
          onChange={handleFilterClick}
          defaultValue={status}
        >
          <S.RadioButton value="UPCOMING">
            {t('eventDashboard.filter.upcoming')}
          </S.RadioButton>
          <S.RadioButton value="PAST">
            {t('eventDashboard.filter.past')}
          </S.RadioButton>
          <S.RadioButton value="PENDING_APPROVAL">
            {t('eventDashboard.filter.waitingForApproval')}
          </S.RadioButton>
          <S.RadioButton value="DRAFT">
            {t('eventDashboard.filter.draft')}
          </S.RadioButton>
        </S.RadioGroup>
      </BaseCol>
    </BaseRow>
  );

  if (isDesktop) {
    return desktopLayout;
  } else {
    return mobileAndTabletLayout;
  }
};

export default FilterBar;
