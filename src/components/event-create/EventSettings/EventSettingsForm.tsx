import React, { useEffect, useState } from 'react';
import { Form, InputNumber, Select, Input, Radio, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  UserOutlined,
  LinkOutlined,
  LockOutlined,
  MessageOutlined,
  GlobalOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import * as S from './EventSettingsForm.styles';
import { FormStepProps } from '../types';
import { BASE_COLORS } from '@/styles/themes/constants';
import { AgeRestriction } from '@/constants/enums/event';
import { useParams } from 'react-router-dom';
import { notificationController } from '@/controllers/notificationController';
import { getEventSetting } from '@/services/event.service';
import { useAppDispatch } from '@/hooks/reduxHooks';

const { TextArea } = Input;
const { Text } = Typography;

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({
  icon,
  title,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    {icon}
    <span>{title}</span>
  </div>
);

interface EventSettingsFormProps extends FormStepProps {}

export const EventSettingsForm: React.FC<EventSettingsFormProps> = ({
  formRef,
}) => {
  const { dispatch } = useAppDispatch();
  const { t } = useTranslation();
  const baseUrl = window.location.origin;
  const [url, setUrl] = useState('');
  const { eventId } = useParams<{ eventId?: string }>();

  useEffect(() => {
    const loadEventData = async () => {
      if (eventId) {
        try {
          const result = await getEventSetting(eventId);
          if (!result) return;

          if (formRef.current) {
            formRef.current.setFieldsValue({
              ...result,
            });
          }

          setUrl(result.url);
        } catch (error) {
          notificationController.error({
            message: error.message || t('event_create.failed_to_load'),
          });
        }
      }
    };

    loadEventData();
  }, [eventId, dispatch, formRef, t]);

  return (
    <Form
      layout="vertical"
      ref={formRef}
      style={{ width: '100%', padding: '0 24px 24px 24px' }}
    >
      {/* Basic Settings Card */}
      <S.FormSection
        title={
          <SectionTitle
            icon={<UserOutlined style={{ color: BASE_COLORS.white }} />}
            title={t('event_settings.basic_settings')}
          />
        }
      >
        <Form.Item
          label={t('event_settings.max_attendees')}
          name="maximumAttendees"
          rules={[
            {
              required: true,
              message: t('event_settings.max_attendees_required'),
            },
          ]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label={t('event_settings.age_restriction')}
          name="ageRestriction"
          rules={[
            {
              required: true,
              message: t('event_settings.age_restriction_required'),
            },
          ]}
        >
          <Select placeholder={t('event_settings.select_age_restriction')}>
            <Select.Option value={AgeRestriction.ALL_AGE}>
              {t('event_settings.all_ages')}
            </Select.Option>
            <Select.Option value={AgeRestriction.OVER_18}>
              {t('event_settings.eighteen_plus')}
            </Select.Option>
            <Select.Option value={AgeRestriction.OVER_21}>
              {t('event_settings.twenty_one_plus')}
            </Select.Option>
          </Select>
        </Form.Item>
      </S.FormSection>

      {/* Event URL Card */}
      <S.FormSection
        title={
          <SectionTitle
            icon={<LinkOutlined style={{ color: BASE_COLORS.white }} />}
            title={t('event_settings.event_url')}
          />
        }
      >
        <Form.Item
          label={t('event_settings.custom_url')}
          name="url"
          rules={[
            {
              required: true,
              message: t('event_settings.custom_url_required'),
            },
            {
              pattern: /^[a-zA-Z0-9-]+$/,
              message: t('event_settings.custom_url_invalid'),
            },
          ]}
        >
          <Input
            addonBefore={`${baseUrl}/events/`}
            placeholder={t('event_settings.custom_url_placeholder')}
            onChange={(e) => setUrl(e.target.value)}
          />
        </Form.Item>

        {url && (
          <Text
            style={{
              color: BASE_COLORS.white,
              display: 'block',
              marginTop: '8px',
            }}
          >
            {t('event_settings.your_event_link_will_be')}:{' '}
            <a
              href={`${baseUrl}/events/${url}${eventId ? `-${eventId}` : ''}`}
              target="_blank"
            >
              {`${baseUrl}/events/${url}${eventId ? `-${eventId}` : ''}`}
            </a>
          </Text>
        )}
      </S.FormSection>

      {/* Event Privacy Card */}
      <S.FormSection
        title={
          <SectionTitle
            icon={<LockOutlined style={{ color: BASE_COLORS.white }} />}
            title={t('event_settings.event_privacy')}
          />
        }
      >
        <Form.Item
          name="isPrivate"
          rules={[
            {
              required: true,
              message: t('event_settings.privacy_required'),
            },
          ]}
        >
          <Radio.Group
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <Radio value={false}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <GlobalOutlined
                  style={{ color: BASE_COLORS.white }}
                  size={24}
                />
                <div>
                  <div>{t('event_settings.public_event')}</div>
                  <Text type="secondary" style={{ color: BASE_COLORS.white }}>
                    {t('event_settings.public_event_desc')}
                  </Text>
                </div>
              </div>
            </Radio>
            <Radio value={true}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <TeamOutlined style={{ color: BASE_COLORS.white }} />
                <div>
                  <div>{t('event_settings.private_event')}</div>
                  <Text type="secondary" style={{ color: BASE_COLORS.white }}>
                    {t('event_settings.private_event_desc')}
                  </Text>
                </div>
              </div>
            </Radio>
          </Radio.Group>
        </Form.Item>
      </S.FormSection>

      {/* Attendee Message Card */}
      <S.FormSection
        title={
          <SectionTitle
            icon={<MessageOutlined style={{ color: BASE_COLORS.white }} />}
            title={t('event_settings.attendee_message')}
          />
        }
      >
        <Form.Item
          label={t('event_settings.confirmation_message')}
          name="messageAttendees"
          rules={[
            {
              required: true,
              message: t('event_settings.message_required'),
            },
          ]}
        >
          <TextArea
            rows={10}
            placeholder={t('event_settings.message_placeholder')}
          />
        </Form.Item>
        <Text type="secondary">{t('event_settings.message_help')}</Text>
      </S.FormSection>
    </Form>
  );
};
