import React from 'react';
import { DatePicker, Form } from 'antd';
import { Box, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ShowModel } from '@/domain/ShowModel';
import classes from './TimePickerSection.module.css';
import { getFormValue } from '@/utils/formUtils';

interface TimePickerSectionProps {
  show: ShowModel;
  showIndex: number;
  formRef: any;
  onTimeUpdate: (updatedShow: ShowModel) => void;
}

function isDayjs(date: any): date is dayjs.Dayjs {
  return dayjs.isDayjs(date);
}

export const TimePickerSection: React.FC<TimePickerSectionProps> = ({
  show,
  showIndex,
  formRef,
  onTimeUpdate,
}) => {
  const { t } = useTranslation();
  const [startTimeError, setStartTimeError] = React.useState('');
  const [endTimeError, setEndTimeError] = React.useState('');

  return (
    <Box className={classes.timePickerContainer}>
      <Box className={classes.formField}>
        <Text className={classes.label}>{t('show_and_ticket.start_time')}</Text>
        <DatePicker
          className={classes.datePicker}
          showTime
          onChange={(date) => {
            let error = '';
            if (!date) {
              error = t('show_and_ticket.validation.start_time_required');
            } else if (show.endTime && dayjs(date).isAfter(dayjs(show.endTime))) {
              error = t('show_and_ticket.validation.start_time_before_end');
            }
            setStartTimeError(error);
            if (!error) {
              const updatedShow = { ...show, startTime: date.toString() };
              onTimeUpdate(updatedShow);
            }
          }}
          value={show.startTime ? dayjs(show.startTime) : null}
        />
        {startTimeError && (
          <Text className={classes.errorMessage}>{startTimeError}</Text>
        )}
      </Box>

      <Box className={classes.formField}>
        <Text className={classes.label}>{t('show_and_ticket.end_time')}</Text>
        <DatePicker
          className={classes.datePicker}
          showTime
          onChange={(date) => {
            let error = '';
            if (!date) {
              error = t('show_and_ticket.validation.end_time_required');
            } else if (show.startTime && dayjs(date).isBefore(dayjs(show.startTime))) {
              error = t('show_and_ticket.validation.end_time_after_start');
            }
            setEndTimeError(error);
            if (!error) {
              const updatedShow = { ...show, endTime: date.toString() };
              onTimeUpdate(updatedShow);
            }
          }}
          value={show.endTime ? dayjs(show.endTime) : null}
        />
        {endTimeError && (
          <Text className={classes.errorMessage}>{endTimeError}</Text>
        )}
      </Box>
    </Box>
  );
};
