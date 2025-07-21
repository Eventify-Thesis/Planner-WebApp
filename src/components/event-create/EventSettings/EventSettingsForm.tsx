import React, { useState, useEffect } from 'react';
import {
  NumberInput,
  Select,
  TextInput,
  Textarea,
  Radio,
  Text,
  Box,
  Paper,
  Stack,
  Flex,
  Anchor,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { IconUser, IconLink, IconLock, IconMessage } from '@tabler/icons-react';
import { FormStepProps } from '../types';
import { AgeRestriction } from '@/constants/enums/event';
import { useParams } from 'react-router-dom';
import { useGetEventSetting } from '@/queries/useGetEventSetting';
import {
  getFormValue,
  safeSetFormValue,
  safeSetFormValues,
} from '@/utils/formUtils';
import { Loading } from '@/components/common/Loading/Loading';

// Styles
const styles = {
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px',
    fontWeight: 600,
    fontSize: '18px',
  },
  sectionIcon: {
    color: 'white',
    backgroundColor: '#228be6',
    width: 30,
    height: 30,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    color: '#868e96',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  radioOption: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #e9ecef',
  },
  urlAddon: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    borderTopLeftRadius: '4px',
    borderBottomLeftRadius: '4px',
    backgroundColor: '#e9ecef',
    border: '1px solid #ced4da',
    borderRight: 0,
    fontSize: '14px',
    height: 40,
  },
  customTextInput: {
    flex: 1,
    height: 42,
    marginBottom: 35,
  },
  textInputWithLeftAddon: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
};

const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({
  icon,
  title,
}) => {
  return (
    <Flex align="center" style={styles.sectionTitle}>
      <Box style={styles.sectionIcon}>{icon}</Box>
      <Text>{title}</Text>
    </Flex>
  );
};

interface EventSettingsFormProps extends FormStepProps {
  formRef?: React.MutableRefObject<ReturnType<typeof useForm> | null>;
}

export const EventSettingsForm: React.FC<EventSettingsFormProps> = ({
  formRef,
}) => {
  const { t } = useTranslation();

  const form = useForm({
    initialValues: {
      maximumAttendees: 0,
      ageRestriction: AgeRestriction.ALL_AGES,
      url: '',
      isPrivate: false,
      messageAttendees: '',
    },
    validate: {
      maximumAttendees: (value) =>
        value <= 0 ? t('event_settings.max_attendees_required') : null,
      ageRestriction: (value) =>
        !value ? t('event_settings.age_restriction_required') : null,
      url: (value) => {
        if (!value) return t('event_settings.custom_url_required');
        if (!/^[a-zA-Z0-9-]+$/.test(value))
          return t('event_settings.custom_url_invalid');
        return null;
      },
      isPrivate: (value) =>
        value === undefined ? t('event_settings.privacy_required') : null,
      messageAttendees: (value) =>
        !value ? t('event_settings.message_required') : null,
    },
  });

  const baseUrl = window.location.origin;
  const { eventId } = useParams<{ eventId?: string }>();
  const [eventName, setEventName] = useState('');

  React.useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
  }, [formRef, form]);

  const { data: eventSetting, isLoading } = useGetEventSetting(eventId);

  useEffect(() => {
    if (eventSetting && formRef) {
      safeSetFormValues(formRef, {
        ...eventSetting,
      });

      setEventName(eventSetting.event.eventName);
    }
  }, [eventSetting, formRef]);

  if (isLoading) {
    return <Loading />;
  }

  const defaultUrl = eventName.replace(/\s/g, '-');

  return (
    <Box
      w="100%"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        height: '100%',
        maxWidth: '100%',
      }}
    >
      {/* Basic Settings Card */}
      <Paper style={styles.section}>
        <SectionTitle
          icon={<IconUser size={18} />}
          title={t('event_settings.basic_settings')}
        />

        <Stack style={{ gap: '16px' }}>
          <NumberInput
            required
            label={t('event_settings.max_attendees')}
            min={1}
            placeholder="100"
            {...form.getInputProps('maximumAttendees')}
            error={form.errors.maximumAttendees}
            withAsterisk
          />

          <Select
            required
            label={t('event_settings.age_restriction')}
            placeholder={t('event_settings.select_age_restriction')}
            data={[
              {
                value: AgeRestriction.ALL_AGES,
                label: t('event_settings.all_ages'),
              },
              {
                value: AgeRestriction.OVER_18,
                label: t('event_settings.eighteen_plus'),
              },
              {
                value: AgeRestriction.OVER_21,
                label: t('event_settings.twenty_one_plus'),
              },
            ]}
            {...form.getInputProps('ageRestriction')}
            error={form.errors.ageRestriction}
            withAsterisk
          />
        </Stack>
      </Paper>

      {/* Event URL Card */}
      <Paper style={styles.section}>
        <SectionTitle
          icon={<IconLink size={18} />}
          title={t('event_settings.event_url')}
        />

        <Stack style={{ gap: '16px' }}>
          <Box style={{ position: 'relative' }}>
            <div
              style={{
                justifyContent: 'space-between',
                alignItems: 'center',
                display: 'flex',
                height: 40,
                flexDirection: 'row',
              }}
            >
              <Box style={styles.urlAddon}>{`${baseUrl}/events/`}</Box>
              <TextInput
                required
                placeholder={t('event_settings.custom_url')}
                label={t('event_settings.custom_url')}
                error={form.errors.url}
                defaultValue={defaultUrl}
                withAsterisk
                {...form.getInputProps('url')}
                style={styles.customTextInput}
                styles={{ input: styles.textInputWithLeftAddon }}
              />
            </div>
          </Box>

          <Text size="sm" color="dimmed">
            {t('event_settings.your_event_link_will_be')}:{' '}
            <Anchor
              href={`${baseUrl}/events/${
                form.values.url.length > 0 ? form.values.url : defaultUrl
              }${eventId ? `-${eventId}` : ''}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {`${baseUrl}/events/${
                form.values.url.length > 0 ? form.values.url : defaultUrl
              }${eventId ? `-${eventId}` : ''}`}
            </Anchor>
          </Text>
        </Stack>
      </Paper>

      {/* Event Privacy Card */}
      <Paper style={styles.section}>
        <SectionTitle
          icon={<IconLock size={18} />}
          title={t('event_settings.event_privacy')}
        />

        <Radio.Group
          name="isPrivate"
          {...form.getInputProps('isPrivate')}
          style={styles.radioGroup}
        >
          <Radio
            value="false"
            checked={form.values.isPrivate == false}
            {...form.getInputProps('isPrivate')}
            label={
              <Flex align="center" style={{ gap: 8 }}>
                <Box>
                  <Text>{t('event_settings.public_event')}</Text>
                  <Text size="xs" color="dimmed">
                    {t('event_settings.public_event_desc')}
                  </Text>
                </Box>
              </Flex>
            }
            style={styles.radioOption}
          />

          <Radio
            value="true"
            checked={form.values.isPrivate == true}
            {...form.getInputProps('isPrivate')}
            label={
              <Flex align="center" style={{ gap: 8 }}>
                <Box>
                  <Text>{t('event_settings.private_event')}</Text>
                  <Text size="xs" color="dimmed">
                    {t('event_settings.private_event_desc')}
                  </Text>
                </Box>
              </Flex>
            }
            style={styles.radioOption}
          />
        </Radio.Group>
      </Paper>

      {/* Attendee Message Card */}
      <Paper style={styles.section}>
        <SectionTitle
          icon={<IconMessage size={18} />}
          title={t('event_settings.attendee_message')}
        />

        <Stack style={{ gap: '8px' }}>
          <Textarea
            required
            label={t('event_settings.confirmation_message')}
            placeholder={t('event_settings.message_placeholder')}
            minRows={10}
            {...form.getInputProps('messageAttendees')}
            error={form.errors.messageAttendees}
            withAsterisk
          />
          <Text size="xs" color="dimmed">
            {t('event_settings.message_help')}
          </Text>
        </Stack>
      </Paper>

      <Flex justify="flex-end" mt="xl">
        <Box style={{ height: 20 }} /> {/* Spacer for bottom margin */}
      </Flex>
    </Box>
  );
};
