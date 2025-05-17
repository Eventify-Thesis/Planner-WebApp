import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { EventType } from '@/constants/enums/event';
import {
  Grid,
  TextInput,
  SegmentedControl,
  Select,
  Box,
  Text,
  Loader,
  Paper,
} from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import styles from './EventLocationSection.module.css';
// Temporarily define interfaces until api modules are properly set up
interface City {
  originId: number;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
}

interface District {
  originId: number;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
}

interface Ward {
  originId: number;
  name: string;
  nameEn: string;
  type: string;
  typeEn: string;
}
import { FormSection } from '../components/FormSection';
import { safeSetFormValue, getFormValue } from '@/utils/formUtils';

interface EventLocationSectionProps {
  eventType: string;
  selectedCity: number | null;
  selectedDistrict: number | null;
  selectedWard: number | null;
  setSelectedCity: (cityId: number) => void;
  setSelectedDistrict: (districtId: number) => void;
  setSelectedWard: (wardId: number) => void;
  cities: City[];
  districts: District[];
  wards: Ward[];
  isDistrictsLoading?: boolean;
  isWardsLoading?: boolean;
  form?: any;
}

export const EventLocationSection: React.FC<EventLocationSectionProps> = ({
  eventType,
  setSelectedCity,
  selectedCity,
  selectedDistrict,
  selectedWard,
  setSelectedDistrict,
  setSelectedWard,
  cities,
  districts,
  wards,
  isDistrictsLoading,
  isWardsLoading,
  form,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <FormSection
      title={t('event_create.event_location.title')}
      icon={<IconMapPin size={22} />}
      colorAccent="accent1"
      subtitle={
        'Set the venue details for your event - either a physical location or an online meeting link.'
      }
      badge="Location"
    >
      <Box className={styles.locationContainer}>
        <Box className={styles.typeToggle}>
          <Text className={styles.fieldLabel}>
            {t('event_create.event_location.type')}
            <span className={styles.requiredMark}>*</span>
          </Text>
          <SegmentedControl
            {...form.getInputProps('eventType')}
            data={[
              {
                label: t('event_create.event_location.offline'),
                value: EventType.OFFLINE,
              },
              {
                label: t('event_create.event_location.online'),
                value: EventType.ONLINE,
              },
            ]}
            size="sm"
            color="blue"
            radius="md"
            fullWidth
            styles={{
              root: {
                border: '1px solid #e5e7eb',
                padding: '4px',
                backgroundColor: '#f8fafc',
              },
              label: {
                fontWeight: 500,
                padding: '8px 12px',
              },
              indicator: {
                boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              },
            }}
          />
        </Box>

        {form.values.eventType === EventType.OFFLINE && (
          <Box>
            <Box className={styles.inputContainer}>
              <Text className={styles.fieldLabel}>
                {t('event_create.event_location.venue_name')}
                <span className={styles.requiredMark}>*</span>
              </Text>
              <TextInput
                placeholder={t('event_create.event_location.venue_name')}
                {...form.getInputProps('venueName')}
              />
            </Box>

            <Grid gutter="md" className={styles.addressGrid}>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Box className={styles.inputContainer}>
                  <Text className={styles.fieldLabel}>
                    {t('event_create.event_location.city')}
                    <span className={styles.requiredMark}>*</span>
                  </Text>
                  <Select
                    placeholder={t(
                      'event_create.event_location.city_placeholder',
                    )}
                    data={cities.map((city) => ({
                      label:
                        language === 'en'
                          ? `${city.typeEn} ${city.nameEn}`
                          : `${city.type} ${city.name}`,
                      value: city.originId.toString(),
                    }))}
                    onChange={(value) => {
                      if (value) {
                        const cityId = parseInt(value, 10);
                        setSelectedCity(cityId);
                        form.values.cityId = cityId;
                      }
                    }}
                    searchable
                    clearable
                  />
                </Box>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Box className={styles.inputContainer}>
                  <Text className={styles.fieldLabel}>
                    {t('event_create.event_location.district')}
                    <span className={styles.requiredMark}>*</span>
                  </Text>
                  <Select
                    placeholder={
                      isDistrictsLoading
                        ? t('event_create.event_location.loading')
                        : t('event_create.event_location.district_placeholder')
                    }
                    data={districts.map((district) => ({
                      label:
                        language === 'en'
                          ? `${district.typeEn} ${district.nameEn}`
                          : `${district.type} ${district.name}`,
                      value: district.originId.toString(),
                    }))}
                    {...form.getInputProps('districtId')}
                    disabled={form.values.cityId === undefined || isDistrictsLoading}
                    onChange={(value) => {
                      if (value) {
                        const districtId = parseInt(value, 10);
                        setSelectedDistrict(districtId);
                        form.values.districtId = districtId;
                      }
                    }}
                    searchable
                    clearable
                    rightSection={
                      isDistrictsLoading ? (
                        <Box style={{ display: 'flex', alignItems: 'center' }}>
                          <Loader size="xs" mr={5} />
                          <Text className={styles.loadingText}>Loading</Text>
                        </Box>
                      ) : null
                    }
                  />
                </Box>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 4 }}>
                <Box className={styles.inputContainer}>
                  <Text className={styles.fieldLabel}>
                    {t('event_create.event_location.ward')}
                    <span className={styles.requiredMark}>*</span>
                  </Text>
                  <Select
                    placeholder={
                      isWardsLoading
                        ? t('event_create.event_location.loading')
                        : t('event_create.event_location.ward_placeholder')
                    }
                    disabled={form.values.districtId === undefined || isWardsLoading}
                    rightSection={
                      isWardsLoading ? (
                        <Box style={{ display: 'flex', alignItems: 'center' }}>
                          <Loader size="xs" mr={5} />
                          <Text className={styles.loadingText}>Loading</Text>
                        </Box>
                      ) : null
                    }
                    {...form.getInputProps('wardId')}
                    data={wards.map((ward) => ({
                      label:
                        language === 'en'
                          ? `${ward.typeEn} ${ward.nameEn}`
                          : `${ward.type} ${ward.name}`,
                      value: ward.originId.toString(),
                    }))}
                    onChange={(value) => {
                      if (value) {
                        const wardId = parseInt(value, 10);
                        setSelectedWard(wardId);
                        form.values.wardId = wardId;
                      }
                    }}
                    searchable
                    clearable
                  />
                </Box>
              </Grid.Col>
            </Grid>

            <Box className={styles.inputContainer}>
              <Text className={styles.fieldLabel}>
                {t('event_create.event_location.street_address')}
                <span className={styles.requiredMark}>*</span>
              </Text>
              <TextInput
                placeholder={t(
                  'event_create.event_location.street_address_placeholder',
                )}
                {...form.getInputProps('street')}
              />
              <Text className={styles.helperText}>
                {t('event_create.event_location.address_help') ||
                  'Enter the full street address including building number, street name, and any additional details.'}
              </Text>
            </Box>
          </Box>
        )}

        {form.values.eventType === EventType.ONLINE && (
          <Box className={styles.inputContainer}>
            <Text className={styles.fieldLabel}>
              {t('event_create.event_location.online_url')}
              <span className={styles.requiredMark}>*</span>
            </Text>
            <TextInput
              placeholder={
                t('event_create.event_location.online_url_placeholder') ||
                'Enter the URL for your online event'
              }
              {...form.getInputProps('onlineUrl')}
            />
            <Text className={styles.helperText}>
              {t('event_create.event_location.online_url_help') ||
                'This URL will be shared with attendees before the event starts.'}
            </Text>
          </Box>
        )}
      </Box>
    </FormSection>
  );
};
