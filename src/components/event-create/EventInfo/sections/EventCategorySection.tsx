import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { Select, Box, Text, Textarea } from '@mantine/core';
import { Category } from '@/api/categories.api';
import { FormSection } from '../components/FormSection';
import styles from './EventCategorySection.module.css';

interface EventCategorySectionProps {
  form: any;
  categories: Category[];
}

export const EventCategorySection: React.FC<EventCategorySectionProps> = ({
  form,
  categories,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <FormSection 
    colorAccent="accent1"
    title={t('event_create.event_category.title')}>
      <Box className={styles.categoryContainer}>
        <Text className={styles.categoryLabel}>
          {t('event_create.event_category.label')}
          <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
        </Text>

        <Select
          placeholder={t('event_create.event_category.placeholder')}
          data={categories.map((category) => ({
            label: language === 'en' ? category.nameEn : category.nameVi,
            value: `${category.id}_${category.code}`,
          }))}
          {...form.getInputProps('category')}
          onChange={(value) => {
            if (value) {
              form.values.category = value
            }
          }}
          clearable
          searchable
          nothingFoundMessage={t('event_create.event_category.nothing_found')}
          className={styles.categorySelect}
          mb="md"
        />

        <Textarea
          label={t('event_create.event_category.info')}
          placeholder={
            t('event_create.event_category.info_placeholder') ||
            'Add additional information about the event category'
          }
          minRows={3}
          autosize
          maxRows={6}
          mb="sm"
        />

        <Text size="sm" className={styles.categoryDescription}>
          {t('event_create.event_category.description') ||
            'Select the most appropriate category to help attendees find your event.'}
        </Text>
      </Box>
    </FormSection>
  );
};
