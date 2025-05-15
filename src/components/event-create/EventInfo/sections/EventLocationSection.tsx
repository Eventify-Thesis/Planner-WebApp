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
  setEventType: (type: string) => void;
  selectedCity: number | null;
  setSelectedCity: (cityId: number) => void;
  selectedDistrict: number | null;
  setSelectedDistrict: (districtId: number) => void;
  selectedWard: number | null;
  setSelectedWard: (wardId: number) => void;
  cities: City[];
  districts: District[];
  wards: Ward[];
  isDistrictsLoading?: boolean;
  isWardsLoading?: boolean;
  formRef?: React.RefObject<any>;
}

export const EventLocationSection: React.FC<EventLocationSectionProps> = ({
  eventType,
  setEventType,
  selectedCity,
  setSelectedCity,
  selectedDistrict,
  setSelectedDistrict,
  selectedWard,
  setSelectedWard,
  cities,
  districts,
  wards,
  isDistrictsLoading,
  isWardsLoading,
  formRef,
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <FormSection
      title={t('event_create.event_location.title')}
      icon={<IconMapPin size={22} />}
      colorAccent="accent2"
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
            value={eventType}
            onChange={(value) => {
              setEventType(value);
              safeSetFormValue(formRef, 'eventType', value);
            }}
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

        {eventType === EventType.OFFLINE && (
          <Box>
            <Box className={styles.inputContainer}>
              <Text className={styles.fieldLabel}>
                {t('event_create.event_location.venue_name')}
                <span className={styles.requiredMark}>*</span>
              </Text>
              <TextInput
                placeholder={t('event_create.event_location.venue_name')}
                onChange={(e) => {
                  const { value } = e.currentTarget;
                  safeSetFormValue(formRef, 'venueName', value);
                }}
                value={getFormValue(formRef, 'venueName')}
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
                    value={
                      getFormValue(formRef, 'cityId')
                        ? getFormValue(formRef, 'cityId').toString()
                        : selectedCity
                        ? selectedCity.toString()
                        : null
                    }
                    onChange={(value) => {
                      if (value) {
                        setSelectedCity(parseInt(value, 10));
                        safeSetFormValue(
                          formRef,
                          'cityId',
                          parseInt(value, 10),
                        );
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
                    value={
                      getFormValue(formRef, 'districtId')
                        ? getFormValue(formRef, 'districtId').toString()
                        : selectedDistrict
                        ? selectedDistrict.toString()
                        : null
                    }
                    onChange={(value) => {
                      if (value) {
                        const districtId = parseInt(value, 10);
                        setSelectedDistrict(districtId);
                        safeSetFormValue(formRef, 'districtId', districtId);
                      }
                    }}
                    disabled={!selectedCity || isDistrictsLoading}
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
                    disabled={!selectedDistrict || isWardsLoading}
                    rightSection={
                      isWardsLoading ? (
                        <Box style={{ display: 'flex', alignItems: 'center' }}>
                          <Loader size="xs" mr={5} />
                          <Text className={styles.loadingText}>Loading</Text>
                        </Box>
                      ) : null
                    }
                    onChange={(value) => {
                      if (value) {
                        const wardId = parseInt(value, 10);
                        setSelectedWard(wardId);
                        safeSetFormValue(formRef, 'wardId', wardId);
                      }
                    }}
                    data={wards.map((ward) => ({
                      label:
                        language === 'en'
                          ? `${ward.typeEn} ${ward.nameEn}`
                          : `${ward.type} ${ward.name}`,
                      value: ward.originId.toString(),
                    }))}
                    value={
                      getFormValue(formRef, 'wardId')
                        ? getFormValue(formRef, 'wardId').toString()
                        : selectedWard
                        ? selectedWard.toString()
                        : null
                    }
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
                onChange={(e) => {
                  const { value } = e.currentTarget;
                  safeSetFormValue(formRef, 'street', value);
                }}
                value={getFormValue(formRef, 'street')}
              />
              <Text className={styles.helperText}>
                {t('event_create.event_location.address_help') ||
                  'Enter the full street address including building number, street name, and any additional details.'}
              </Text>
            </Box>
          </Box>
        )}

        {eventType === EventType.ONLINE && (
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
              onChange={(e) => {
                const { value } = e.currentTarget;
                safeSetFormValue(formRef, 'onlineUrl', value);
              }}
              value={getFormValue(formRef, 'onlineUrl')}
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
