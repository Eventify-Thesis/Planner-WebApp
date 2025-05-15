import React from 'react';
import { DatePicker, Form } from 'antd';
import { Box, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ShowModel } from '@/domain/ShowModel';
import classes from './TimePickerSection.module.css';

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

  return (
    <Box className={classes.timePickerContainer}>
      <Box className={classes.formField}>
        <Text className={classes.label}>{t('show_and_ticket.start_time')}</Text>
        <Form.Item
          name={['shows', showIndex, 'startTime']}
          noStyle
          rules={[
            {
              required: true,
              message: t('show_and_ticket.validation.start_time_required'),
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const endTime = getFieldValue(['shows', showIndex, 'endTime']);
                if (
                  isDayjs(value) &&
                  isDayjs(endTime) &&
                  !value.isBefore(endTime)
                ) {
                  return Promise.reject(
                    new Error(
                      t('show_and_ticket.validation.start_time_before_end'),
                    ),
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker
            className={classes.datePicker}
            showTime
            onChange={(date) => {
              const updatedShow = { ...show, startTime: date };
              onTimeUpdate(updatedShow);
            }}
          />
        </Form.Item>
      </Box>

      <Box className={classes.formField}>
        <Text className={classes.label}>{t('show_and_ticket.end_time')}</Text>
        <Form.Item
          name={['shows', showIndex, 'endTime']}
          noStyle
          rules={[
            {
              required: true,
              message: t('show_and_ticket.validation.end_time_required'),
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                const startTime = getFieldValue([
                  'shows',
                  showIndex,
                  'startTime',
                ]);
                if (
                  isDayjs(value) &&
                  isDayjs(startTime) &&
                  !value.isAfter(startTime)
                ) {
                  return Promise.reject(
                    new Error(
                      t('show_and_ticket.validation.end_time_after_start'),
                    ),
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker
            className={classes.datePicker}
            showTime
            onChange={(date) => {
              const updatedShow = { ...show, endTime: date };
              onTimeUpdate(updatedShow);
            }}
          />
        </Form.Item>
      </Box>
    </Box>
  );
};
