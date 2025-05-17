import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, Box, Paper } from '@mantine/core';
import { IconArticle } from '@tabler/icons-react';
import Editor from '../EventDescriptionEditor/EventDescriptionEditor';
import { FormSection } from '../components/FormSection';
import classes from './EventDescriptionSection.module.css';
import { safeSetFormValue } from '@/utils/formUtils';

interface EventDescriptionSectionProps {
  editorHtml: string;
  setEditorHtml: (html: string) => void;
  form: any;
}

export const EventDescriptionSection: React.FC<
  EventDescriptionSectionProps
> = ({ editorHtml, setEditorHtml, form }) => {
  const { t } = useTranslation();

  return (
    <FormSection
      title={t('event_create.event_description.title')}
      icon={<IconArticle size={22} />}
      colorAccent="accent1"
      subtitle={
        'Craft a compelling description of your event that will attract and inform potential attendees.'
      }
      badge="Content"
    >
      <Box mb="md">
        <Text fw={600} size="sm" mb="xs">
          {t('event_create.event_description.label')}
          <Text span c="red" ml={4}>
            *
          </Text>
        </Text>
        <Box
          className={classes.editorContainer}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
          }}
        >
          <Editor
            editorHtml={editorHtml}
            onChange={(html) => {
              setEditorHtml(html);
              form.values.eventDescription = html;
            }}
          />
        </Box>
      </Box>
    </FormSection>
  );
};
