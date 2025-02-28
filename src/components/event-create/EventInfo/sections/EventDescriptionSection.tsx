import React from 'react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import * as S from '../EventInfoForm.styles';
import Editor from '../EventDescriptionEditor/EventDescriptionEditor';

interface EventDescriptionSectionProps {
  editorHtml: string;
  setEditorHtml: (html: string) => void;
}

export const EventDescriptionSection: React.FC<EventDescriptionSectionProps> = ({
  editorHtml,
  setEditorHtml,
}) => {
  const { t } = useTranslation();

  return (
    <S.FormSection title={t('event_create.event_description.title')}>
      <Form.Item
        label={t('event_create.event_description.label')}
        name="eventDescription"
        rules={[
          {
            required: true,
            message: t('event_create.event_description.required'),
          },
        ]}
      >
        <Editor editorHtml={editorHtml} onChange={setEditorHtml} />
      </Form.Item>
    </S.FormSection>
  );
};
