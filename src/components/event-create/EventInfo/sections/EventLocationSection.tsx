import React from 'react';
import { Form, Input, Radio, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { EventType } from '@/constants/enums/event';
import * as S from '../EventInfoForm.styles';
import { City, District, Ward } from '@/api/locations.api';

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
}) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <S.FormSection title={t('event_create.event_location.title')}>
      <Form.Item
        label={t('event_create.event_location.type')}
        name="eventType"
        rules={[
          {
            required: true,
            message: t('event_create.event_location.type_required'),
          },
        ]}
      >
        <Radio.Group
          onChange={(e) => setEventType(e.target.value)}
          value={eventType}
          optionType="default"
        >
          <Radio.Button value={EventType.OFFLINE}>
            {t('event_create.event_location.offline')}
          </Radio.Button>
          <Radio.Button value={EventType.ONLINE}>
            {t('event_create.event_location.online')}
          </Radio.Button>
        </Radio.Group>
      </Form.Item>

      {eventType === EventType.OFFLINE && (
        <div>
          <Form.Item
            label={t('event_create.event_location.venue_name')}
            name="venueName"
            rules={[
              {
                required: true,
                message: t('event_create.event_location.venue_name_required'),
              },
            ]}
          >
            <Input placeholder={t('event_create.event_location.venue_name')} />
          </Form.Item>
          <S.LocationGrid>
            <Form.Item
              label={t('event_create.event_location.city')}
              name="cityId"
              rules={[
                {
                  required: true,
                  message: t('event_create.event_location.city_required'),
                },
              ]}
            >
              <Select
                placeholder={t('event_create.event_location.city_placeholder')}
                onChange={setSelectedCity}
                options={cities.map((city) => ({
                  label:
                    language === 'en'
                      ? `${city.typeEn} ${city.nameEn}`
                      : `${city.type} ${city.name}`,
                  value: city.originId,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={t('event_create.event_location.district')}
              name="districtId"
              rules={[
                {
                  required: true,
                  message: t('event_create.event_location.district_required'),
                },
              ]}
            >
              <Select
                placeholder={t(
                  'event_create.event_location.district_placeholder',
                )}
                disabled={!selectedCity}
                onChange={setSelectedDistrict}
                options={districts.map((district) => ({
                  label:
                    language === 'en'
                      ? `${district.typeEn} ${district.nameEn}`
                      : `${district.type} ${district.name}`,
                  value: district.originId,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={t('event_create.event_location.ward')}
              name="wardId"
              rules={[
                {
                  required: true,
                  message: t('event_create.event_location.ward_required'),
                },
              ]}
            >
              <Select
                placeholder={t('event_create.event_location.ward_placeholder')}
                disabled={!selectedDistrict}
                onChange={setSelectedWard}
                options={wards.map((ward) => ({
                  label:
                    language === 'en'
                      ? `${ward.typeEn} ${ward.nameEn}`
                      : `${ward.type} ${ward.name}`,
                  value: ward.originId,
                }))}
              />
            </Form.Item>

            <Form.Item
              label={t('event_create.event_location.street_address')}
              name="street"
              rules={[
                {
                  required: true,
                  message: t(
                    'event_create.event_location.street_address_required',
                  ),
                },
              ]}
            >
              <Input
                placeholder={t(
                  'event_create.event_location.street_address_placeholder',
                )}
              />
            </Form.Item>
          </S.LocationGrid>
        </div>
      )}
    </S.FormSection>
  );
};
