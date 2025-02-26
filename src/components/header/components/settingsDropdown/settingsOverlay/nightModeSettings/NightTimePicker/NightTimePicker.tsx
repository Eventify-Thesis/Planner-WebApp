import React from 'react';
import { NightTimeSlider } from '@/components/header/dropdowns/settingsDropdown/settingsOverlay/nightModeSettings/NightTimeSlider/NightTimeSlider';
import * as S from './NightTimePicker.styles';

interface NightTimePickerProps {
  nightTime: number[];
  setNightTime: (nightTime: number[]) => void;
}

export const NightTimePicker: React.FC<NightTimePickerProps> = ({
  nightTime,
  setNightTime,
}) => {
  return (
    <S.Wrapper>
      <NightTimeSlider
        from={nightTime[0]}
        to={nightTime[1]}
        setNightTime={setNightTime}
      />
    </S.Wrapper>
  );
};
