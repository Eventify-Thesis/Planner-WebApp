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
} from '@mantine/core';
import { IconMapPin } from '@tabler/icons-react';
import styles from './EventLocationSection.module.css';
import { GooglePlacesAutocomplete } from '@/components/common/GooglePlacesAutocomplete/GooglePlacesAutocomplete';
import { FormSection } from '../components/FormSection';

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

interface PlaceDetails {
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
  addressComponents: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
}

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

  const handlePlaceSelect = async (place: PlaceDetails) => {
    if (!place.latitude || !place.longitude) return;

    const lat = place.latitude;
    const lng = place.longitude;
    const formattedAddress = place.formattedAddress;
    const placeId = place.placeId;

    // Get address components
    const addressComponents = place.addressComponents || [];
    let streetNumber = '';
    let route = '';
    let ward = '';
    let district = '';
    let city = '';

    // Try to get information from address components first
    addressComponents.forEach((component) => {
      const types = component.types;
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        route = component.long_name;
      } else if (types.includes('sublocality_level_1')) {
        ward = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        district = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        city = component.long_name;
      }
    });

    // If we don't have ward information from address components, parse from formatted address
    if (!ward) {
      const addressParts = formattedAddress
        .split(', ')
        .map((part) => part.trim());

      // Vietnamese address format: street, ward, district, city, country
      // Example: "227 Đ. Nguyễn Văn Cừ, Phường 4, Quận 5, Hồ Chí Minh, Việt Nam"
      if (addressParts.length >= 4) {
        // Find ward (Phường) in the address parts
        const wardPart = addressParts.find((part) => part.startsWith('Phường'));
        if (wardPart) {
          ward = wardPart;
        }

        // If we still don't have city or district, get them from formatted address
        if (!city) {
          city = addressParts[addressParts.length - 2];
        }

        if (!district) {
          const districtPart = addressParts.find((part) =>
            part.startsWith('Quận'),
          );
          if (districtPart) {
            district = districtPart;
          }
        }

        // If we don't have street info from components, parse from formatted address
        if (!streetNumber && !route) {
          const streetParts = addressParts.slice(0, -4);
          const streetAddress = streetParts.join(', ');
          const streetMatch = streetAddress.match(/^(\d+)\s+(.+)$/);
          if (streetMatch) {
            streetNumber = streetMatch[1];
            route = streetMatch[2];
          } else {
            route = streetAddress;
          }
        }
      }
    }

    // Find matching city
    const matchingCity = cities.find(
      (c) =>
        c.name.toLowerCase() === city.toLowerCase() ||
        c.nameEn.toLowerCase() === city.toLowerCase(),
    );

    if (matchingCity) {
      setSelectedCity(matchingCity.originId);
      form.setFieldValue('cityId', matchingCity.originId);

      // Extract district name from "Quận 5" -> "5"
      const districtName = district.replace(/^Quận\s+/, '').trim();

      // Find matching district
      const matchingDistrict = districts.find(
        (d) =>
          d.name.toLowerCase() === districtName.toLowerCase() ||
          d.nameEn.toLowerCase() === districtName.toLowerCase(),
      );

      if (matchingDistrict) {
        setSelectedDistrict(matchingDistrict.originId);
        form.setFieldValue('districtId', matchingDistrict.originId);

        // Extract ward name from "Phường 4" -> "4"
        const wardName = ward.replace(/^Phường\s+/, '').trim();

        // Find matching ward
        const matchingWard = wards.find(
          (w) =>
            w.name.toLowerCase() === wardName.toLowerCase() ||
            w.nameEn.toLowerCase() === wardName.toLowerCase(),
        );

        if (matchingWard) {
          setSelectedWard(matchingWard.originId);
          form.setFieldValue('wardId', matchingWard.originId);
        }
      }
    }

    // Set street address
    const streetAddress = [streetNumber, route].filter(Boolean).join(' ');
    form.setFieldValue('street', streetAddress);

    // Set Google Places data
    form.setFieldValue('latitude', lat);
    form.setFieldValue('longitude', lng);
    form.setFieldValue('formattedAddress', formattedAddress);
    form.setFieldValue('placeId', placeId);
  };

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
            onChange={(value) => {
              if (value) {
                form.values.eventType = value;
              }
            }}
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

        {form.values.eventType !== EventType.ONLINE && (
          <Box>
            <Box className={styles.inputContainer}>
              <Text className={styles.fieldLabel}>
                {t('event_create.event_location.venue_name')}
                <span className={styles.requiredMark}>*</span>
              </Text>
              <GooglePlacesAutocomplete
                placeholder={t('event_create.event_location.venue_name')}
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}
                value={form.values.formattedAddress}
                onChange={(value) => {
                  form.values.venueName = value;
                }}
                onPlaceSelect={handlePlaceSelect}
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
                    value={selectedCity?.toString()}
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
                    disabled={
                      form.values.cityId === undefined || isDistrictsLoading
                    }
                    onChange={(value) => {
                      if (value) {
                        const districtId = parseInt(value, 10);
                        setSelectedDistrict(districtId);
                        form.values.districtId = districtId;
                      }
                    }}
                    value={selectedDistrict?.toString()}
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
                    disabled={
                      form.values.districtId === undefined || isWardsLoading
                    }
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
                    value={selectedWard?.toString()}
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
