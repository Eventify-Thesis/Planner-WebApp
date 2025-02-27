import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Radio, Upload, message, Modal } from 'antd';
import { FormStepProps } from '../types';
import * as S from './EventInfoForm.styles';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { BaseCol } from '@/components/common/BaseCol/BaseCol';
import Editor from './EventDescriptionEditor/EventDescriptionEditor';
import { useAppDispatch } from '@/hooks/reduxHooks';
import {
  getCities,
  getDistricts,
  getWards,
} from '@/store/slices/locationSlice';
import { City, District, Ward } from '@/api/locations.api';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/hooks/useLanguage';
import { Category } from '@/api/categories.api';
import { getCategories } from '@/store/slices/categorySlice';
import { Icon } from '@iconify/react/dist/iconify.js';
import { EventType } from '@/constants/enums/event';
import { uploadFile } from '@/services/fileUpload.service';
import { useParams } from 'react-router-dom';
import { notificationController } from '@/controllers/notificationController';
import { getEventDetail } from '@/store/slices/eventSlice';

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const EventInfoForm: React.FC<FormStepProps> = ({ formRef }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [eventType, setEventType] = useState('offline');
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const [eventLogoURL, setEventLogoURL] = useState('');
  const [orgLogoURL, setOrgLogoURL] = useState('');
  const [eventBannerURL, setEventBannerURL] = useState('');

  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const { eventId } = useParams<{ eventId?: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const [fileList, setFileList] = useState<{
    logo: UploadFile[];
    banner: UploadFile[];
    organizerLogo: UploadFile[];
  }>({
    logo: [],
    banner: [],
    organizerLogo: [],
  });

  const [editorHtml, setEditorHtml] = useState('');

  const transformFile = (url: string, fieldName: string) => {
    if (!url) return [];
    return [
      {
        uid: `-1`, // Use a unique identifier
        name: fieldName,
        status: 'done',
        url: url,
      },
    ];
  };

  useEffect(() => {
    const loadEventData = async () => {
      if (eventId) {
        try {
          const result = await dispatch(getEventDetail(eventId)).unwrap();
          const eventData = result;
          if (!eventData) return;

          if (formRef.current) {
            formRef.current.setFieldsValue(eventData);
            setEventLogoURL(eventData.eventLogoURL);
            setOrgLogoURL(eventData.orgLogoURL);
            setEventBannerURL(eventData.eventBannerURL);
            setEditorHtml(eventData.eventDescription);
            const category =
              eventData.categoriesIds[0] + '_' + eventData.categories[0];

            setSelectedCategory(category);

            setFileList({
              logo: transformFile(eventData.eventLogoURL, 'logo'),
              banner: transformFile(eventData.eventBannerURL, 'banner'),
              organizerLogo: transformFile(
                eventData.orgLogoURL,
                'organizerLogo',
              ),
            });
          }
        } catch (error) {
          notificationController.error({
            message: error.message || t('event_create.failed_to_load'),
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadEventData();
  }, [eventId, dispatch, formRef, t]);

  useEffect(() => {
    dispatch(getCities(1))
      .unwrap()
      .then((res) => {
        setCities(res.result);
      })
      .catch((error) => {
        console.error('Failed to fetch cities:', error);
      });
  }, []);

  useEffect(() => {
    dispatch(getCategories())
      .unwrap()
      .then((res) => {
        setCategories(res.result);
      })
      .catch((error) => {
        console.error('Failed to fetch categories:', error);
      });
  }, []);

  useEffect(() => {
    if (!selectedCity) return;
    dispatch(getDistricts(selectedCity))
      .unwrap()
      .then((res) => {
        setDistricts(res.result);
      });
  }, [selectedCity]);

  useEffect(() => {
    if (!selectedDistrict) return;
    dispatch(getWards(selectedDistrict))
      .unwrap()
      .then((res) => {
        setWards(res.result);
      });
  }, [selectedDistrict]);

  const handleCancel = () => setPreviewOpen(false);

  const handleChangeLogo: UploadProps['onChange'] = async ({
    fileList: newFileList,
  }) => {
    setFileList((prevFileList) => ({
      ...prevFileList,
      logo: newFileList,
    }));

    const eventLogoURL = await uploadFile(
      newFileList[0].originFileObj as RcFile,
    );

    formRef.current.setFieldsValue({
      eventLogoURL,
    });
  };

  const handleChangeBanner: UploadProps['onChange'] = async ({
    fileList: newFileList,
  }) => {
    setFileList((prevFileList) => ({
      ...prevFileList,
      banner: newFileList,
    }));

    const eventBannerURL = await uploadFile(
      newFileList[0].originFileObj as RcFile,
    );

    formRef.current.setFieldsValue({
      eventBannerURL,
    });
  };

  const handleChangeOrganizerLogo: UploadProps['onChange'] = async ({
    fileList: newFileList,
  }) => {
    setFileList((prevFileList) => ({
      ...prevFileList,
      organizerLogo: newFileList,
    }));

    const orgLogoURL = await uploadFile(newFileList[0].originFileObj as RcFile);

    formRef.current.setFieldsValue({
      orgLogoURL,
    });
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1),
    );
  };

  const uploadProps = () => ({
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) message.error(t('event_create.image_only'));
      return isImage;
    },
    listType: 'picture-card',
    multiple: false,
    accept: 'image/*',
    onPreview: handlePreview,
  });

  const previewModal = (
    <Modal
      open={previewOpen}
      title={previewTitle}
      footer={null}
      onCancel={handleCancel}
    >
      <img alt="example" style={{ width: '100%' }} src={previewImage} />
    </Modal>
  );

  return (
    <Form
      layout="vertical"
      ref={formRef}
      style={{ width: '100%', padding: '1.5rem' }}
    >
      {/* Section 1: Event Identity */}
      <S.FormSection title={t('event_create.event_identity.title')}>
        <BaseRow gutter={[24, 24]} className="w-full mb-6">
          <BaseCol className="w-full md:w-1/4">
            <Form.Item
              label={t('event_create.event_identity.logo')}
              name="eventLogoURL"
              rules={[
                {
                  required: true,
                  message: t('event_create.event_identity.logo_required'),
                },
              ]}
            >
              <Upload
                {...uploadProps()}
                onChange={handleChangeLogo}
                fileList={fileList['logo']}
                className="w-full"
                beforeUpload={() => false}
              >
                {fileList['logo'].length < 1 && (
                  <div className="h-[400px] flex flex-col justify-center items-center">
                    <UploadIcon />
                    <div className="mt-2">
                      {t('event_create.event_identity.logo')}
                    </div>
                  </div>
                )}
              </Upload>
              {previewModal}
            </Form.Item>
          </BaseCol>

          <BaseCol className="w-full md:w-3/4">
            <Form.Item
              label={t('event_create.event_identity.banner')}
              name="eventBannerURL"
              rules={[
                {
                  required: true,
                  message: t('event_create.event_identity.banner_required'),
                },
              ]}
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
            >
              <Upload
                {...uploadProps()}
                onChange={handleChangeBanner}
                fileList={fileList.banner}
                className="w-full"
                beforeUpload={() => false}
              >
                {fileList.banner.length < 1 && (
                  <div className="h-[400px] flex flex-col justify-center items-center">
                    <UploadIcon />
                    <div className="mt-2">
                      {t('event_create.event_identity.banner')}
                    </div>
                  </div>
                )}
              </Upload>
              {previewModal}
            </Form.Item>
          </BaseCol>
        </BaseRow>
        <Form.Item
          label={t('event_create.event_identity.name')}
          name="eventName"
          rules={[
            {
              required: true,
              message: t('event_create.event_identity.name_required'),
            },
          ]}
        >
          <Input
            placeholder={t('event_create.event_identity.name')}
            size="large"
          />
        </Form.Item>
      </S.FormSection>

      {/* Section 2: Event Location */}
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
              <Input
                placeholder={t('event_create.event_location.venue_name')}
              />
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
                  placeholder={t(
                    'event_create.event_location.city_placeholder',
                  )}
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
                  placeholder={t(
                    'event_create.event_location.ward_placeholder',
                  )}
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

      {/* Section 3: Event Category */}
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
            value={selectedCategory}
            options={categories.map((category) => {
              return {
                label: language === 'en' ? category.nameEn : category.nameVi,
                value: `${category.id}_${category.code}`,
              };
            })}
          />
        </Form.Item>
      </S.FormSection>

      {/* Section 4: Event Description */}
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

      {/* Section 5: Organizer Information */}
      <S.FormSection title={t('event_create.organizer_information.title')}>
        <BaseRow
          gutter={[16, 16]}
          style={{
            width: '100%',
          }}
        >
          <Form.Item
            style={{
              width: '20%',
            }}
            label={t('event_create.organizer_information.logo')}
            name="orgLogoURL"
            rules={[
              {
                required: true,
                message: t('event_create.organizer_information.logo_required'),
              },
            ]}
          >
            <Upload
              {...uploadProps()}
              fileList={fileList.organizerLogo}
              onChange={handleChangeOrganizerLogo}
              beforeUpload={() => false}
            >
              {fileList.organizerLogo.length < 1 && (
                <div className="h-[200px] flex flex-col justify-center items-center">
                  <UploadIcon />

                  <div style={{ marginTop: 8 }}>
                    {t('event_create.organizer_information.logo_required')}
                  </div>
                </div>
              )}
            </Upload>
            {previewModal}
          </Form.Item>

          <BaseCol
            style={{
              height: '200px',
              width: '80%',
            }}
          >
            <Form.Item
              label={t('event_create.organizer_information.name')}
              name="orgName"
              rules={[
                {
                  required: true,
                  message: t(
                    'event_create.organizer_information.name_required',
                  ),
                },
              ]}
            >
              <Input
                placeholder={t('event_create.organizer_information.name')}
              />
            </Form.Item>

            <Form.Item
              label={t('event_create.organizer_information.information')}
              name="orgDescription"
              rules={[
                {
                  required: true,
                  message: t(
                    'event_create.organizer_information.info_required',
                  ),
                },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder={t(
                  'event_create.organizer_information.information',
                )}
              />
            </Form.Item>
          </BaseCol>
        </BaseRow>
      </S.FormSection>
    </Form>
  );
};

export default EventInfoForm;

const UploadIcon = () => {
  return (
    <Icon
      icon="mingcute:upload-fill"
      width="30"
      height="30"
      style={{ color: '#2dc275' }}
    />
  );
};
