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
import { useGetWardsByCity } from '@/queries/useLocationQueries';

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

  // Use new query for Vietnam 2025 restructuring - get wards directly from cities
  const { data: wardsByCity = [], isLoading: isWardsByCityLoading } =
    useGetWardsByCity(selectedCity);

  // Store ward info for matching after wards are loaded
  const [pendingWardMatch, setPendingWardMatch] = React.useState<string | null>(
    null,
  );

  // Effect to match ward when wards data becomes available
  React.useEffect(() => {
    if (pendingWardMatch && wardsByCity.length > 0 && !isWardsByCityLoading) {
      // Try multiple ward name variations
      const wardVariations = [
        pendingWardMatch, // Full name as is (e.g., "Phường 9")
        pendingWardMatch.replace(/^(Phường|Ward|Xã|Thị trấn)\s+/i, '').trim(), // Remove prefixes (e.g., "9")
        pendingWardMatch.replace(/\s+(Ward|Phường|Xã|Thị trấn)$/i, '').trim(), // Remove suffixes
        // Add number padding for better matching (e.g., "9" -> "09")
        pendingWardMatch.replace(
          /^(Phường|Ward|Xã|Thị trấn)\s+(\d)$/i,
          (match, prefix, num) => num.padStart(2, '0'),
        ),
      ];

      const matchingWard = wardsByCity.find((w) => {
        const isMatch = wardVariations.some((variation) => {
          const wardName = w.name.toLowerCase();
          const wardNameEn = w.nameEn.toLowerCase();
          const variationLower = variation.toLowerCase();

          return (
            wardName === variationLower ||
            wardNameEn === variationLower ||
            wardName.includes(variationLower) ||
            wardNameEn.includes(variationLower) ||
            variationLower.includes(wardName) ||
            variationLower.includes(wardNameEn) ||
            // Try matching just the numbers for cases like "Phường 9" vs "9"
            (() => {
              const wardMatch = wardName.match(/\d+/);
              const variationMatch = variationLower.match(/\d+/);
              return (
                wardMatch &&
                variationMatch &&
                wardMatch[0] === variationMatch[0]
              );
            })()
          );
        });

        return isMatch;
      });

      if (matchingWard) {
        setSelectedWard(matchingWard.originId);
        form.setFieldValue('wardId', matchingWard.originId);
      }

      setPendingWardMatch(null); // Clear pending match
    }
  }, [
    wardsByCity,
    pendingWardMatch,
    isWardsByCityLoading,
    setSelectedWard,
    form,
  ]);

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

    // Parse additional information from formatted address
    const addressParts = formattedAddress
      .split(', ')
      .map((part) => part.trim());

    // Vietnamese address format: street, ward, district, city, country
    // Example: "221 Đ. Lý Thường Kiệt, Phường 9, Quận 11, Hồ Chí Minh, Việt Nam"
    if (addressParts.length >= 4) {
      // Find ward (Phường) in the address parts - this is often missing from address_components
      const wardPart = addressParts.find((part) =>
        part.match(/^(Phường|Xã|Thị trấn)\s+/i),
      );
      if (wardPart && !ward) {
        ward = wardPart;
      }

      // If we still don't have city or district, get them from formatted address
      if (!city) {
        city = addressParts[addressParts.length - 2]; // Second last is usually city
      }

      if (!district) {
        const districtPart = addressParts.find((part) =>
          part.match(/^(Quận|Huyện|Thành phố|Thị xã)\s+/i),
        );
        if (districtPart) {
          district = districtPart;
        }
      }

      // If we don't have street info from components, parse from formatted address
      if (!streetNumber && !route) {
        // First part should be the street address
        const streetPart = addressParts[0];
        const streetMatch = streetPart.match(/^(\d+)\s+(.+)$/);
        if (streetMatch) {
          streetNumber = streetMatch[1];
          route = streetMatch[2];
        } else {
          route = streetPart;
        }
      }
    }

    // Find matching city
    const matchingCity = cities.find(
      (c) =>
        c.name.toLowerCase().includes(city.toLowerCase()) ||
        c.nameEn.toLowerCase().includes(city.toLowerCase()) ||
        city.toLowerCase().includes(c.name.toLowerCase()) ||
        city.toLowerCase().includes(c.nameEn.toLowerCase()),
    );

    if (matchingCity) {
      setSelectedCity(matchingCity.originId);
      form.setFieldValue('cityId', matchingCity.originId);

      // Store ward for later matching when wards data becomes available
      if (ward) {
        setPendingWardMatch(ward);
      }
    }

    // Set street address
    const streetAddress = [streetNumber, route].filter(Boolean).join(' ');
    form.setFieldValue('street', streetAddress);

    // Set Google Places data
    form.setFieldValue('latitude', lat);
    form.setFieldValue('longitude', lng);
    form.setFieldValue('formattedAddress', formattedAddress);
    // Set venue name to the place name (e.g., "Sân vận động Phú Thọ"), not the formatted address
    form.setFieldValue('venueName', place.name);
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
                value={form.values.venueName || ''}
                onChange={(value) => {
                  form.setFieldValue('venueName', value);
                  // Clear formatted address if user is typing manually
                  if (!value) {
                    form.setFieldValue('formattedAddress', '');
                  }
                }}
                onPlaceSelect={handlePlaceSelect}
              />
            </Box>

            <Grid gutter="md" className={styles.addressGrid}>
              <Grid.Col span={{ base: 12, md: 6 }}>
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

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Box className={styles.inputContainer}>
                  <Text className={styles.fieldLabel}>
                    {t('event_create.event_location.ward')}
                    <span className={styles.requiredMark}>*</span>
                  </Text>
                  <Select
                    placeholder={
                      isWardsByCityLoading
                        ? t('event_create.event_location.loading')
                        : t('event_create.event_location.ward_placeholder')
                    }
                    disabled={
                      form.values.cityId === undefined || isWardsByCityLoading
                    }
                    rightSection={
                      isWardsByCityLoading ? (
                        <Box style={{ display: 'flex', alignItems: 'center' }}>
                          <Loader size="xs" mr={5} />
                          <Text className={styles.loadingText}>Loading</Text>
                        </Box>
                      ) : null
                    }
                    {...form.getInputProps('wardId')}
                    data={wardsByCity.map((ward) => ({
                      label: language === 'en' ? ward.nameEn : ward.name,
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
