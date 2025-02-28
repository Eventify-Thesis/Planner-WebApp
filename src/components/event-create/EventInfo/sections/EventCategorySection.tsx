import React from 'react';
import { Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import * as S from '../EventInfoForm.styles';
import { Category } from '@/api/categories.api';

interface EventCategorySectionProps {
  categories: Category[];
  selectedCategory: string | null;
}

export const EventCategorySection: React.FC<EventCategorySectionProps> = ({
  categories,
  selectedCategory,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <S.FormSection title={t('event_create.event_category.title')}>
      <Form.Item
        label={t('event_create.event_category.label')}
        name="category"
        rules={[
          {
            required: true,
            message: t('event_create.event_category.required'),
          },
        ]}
      >
        <Select
          placeholder={t('event_create.event_category.placeholder')}
          value={selectedCategory || ''}
          options={categories.map((category) => ({
            label: language === 'en' ? category.nameEn : category.nameVi,
            value: `${category.id}_${category.code}`,
          }))}
        />
      </Form.Item>
    </S.FormSection>
  );
};
