import React from 'react';
import { DatePicker, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ShowingModel } from '@/domain/ShowModel';
import { TimePickerContainer } from '../ShowAndTicketForm.styles';

interface TimePickerSectionProps {
  show: ShowingModel;
  showIndex: number;
  formRef: any;
  onTimeUpdate: (updatedShow: ShowingModel) => void;
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
    <TimePickerContainer>
      <Form.Item
        name={['shows', showIndex, 'startTime']}
        label={t('show_and_ticket.start_time')}
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
          showTime
          onChange={(date) => {
            const updatedShow = { ...show, startTime: date };
            onTimeUpdate(updatedShow);
          }}
        />
      </Form.Item>

      <Form.Item
        name={['shows', showIndex, 'endTime']}
        label={t('show_and_ticket.end_time')}
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
          showTime
          onChange={(date) => {
            const updatedShow = { ...show, endTime: date };
            onTimeUpdate(updatedShow);
          }}
        />
      </Form.Item>
    </TimePickerContainer>
  );
};
