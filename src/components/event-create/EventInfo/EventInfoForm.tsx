import React, { useEffect, useState } from 'react';
import { Form, message, Modal } from 'antd';
import { FormStepProps } from '../types';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { useAppDispatch } from '@/hooks/reduxHooks';
import {
  getCities,
  getDistricts,
  getWards,
} from '@/store/slices/locationSlice';
import { City, District, Ward } from '@/api/locations.api';
import { useTranslation } from 'react-i18next';
import { Category } from '@/api/categories.api';
import { getCategories } from '@/store/slices/categorySlice';
import { EventType } from '@/constants/enums/event';
import { useParams } from 'react-router-dom';
import { notificationController } from '@/controllers/notificationController';
import { getEventDetail } from '@/store/slices/eventSlice';
import { EventIdentitySection } from './sections/EventIdentitySection';
import { EventLocationSection } from './sections/EventLocationSection';
import { EventCategorySection } from './sections/EventCategorySection';
import { EventDescriptionSection } from './sections/EventDescriptionSection';
import { OrganizerInformationSection } from './sections/OrganizerInformationSection';
import { transformFile } from '@/utils/utils';

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

  const [eventType, setEventType] = useState(EventType.OFFLINE);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

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

  useEffect(() => {
    const loadEventData = async () => {
      if (eventId) {
        try {
          const result = await dispatch(getEventDetail(eventId)).unwrap();
          const eventData = result;
          if (!eventData) return;

          const category =
            eventData.categoriesIds[0] + '_' + eventData.categories[0];
          setSelectedCategory(category);
          setEventType(eventData.eventType);

          if (formRef.current) {
            formRef.current.setFieldsValue({
              ...eventData,
              category,
            });
            setEditorHtml(eventData.eventDescription);

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
  }, [dispatch]);

  useEffect(() => {
    dispatch(getCategories())
      .unwrap()
      .then((res) => {
        setCategories(res.result);
      })
      .catch((error) => {
        console.error('Failed to fetch categories:', error);
      });
  }, [dispatch]);

  useEffect(() => {
    if (!selectedCity) return;
    dispatch(getDistricts(selectedCity))
      .unwrap()
      .then((res) => {
        setDistricts(res.result);
      });
  }, [selectedCity, dispatch]);

  useEffect(() => {
    if (!selectedDistrict) return;
    dispatch(getWards(selectedDistrict))
      .unwrap()
      .then((res) => {
        setWards(res.result);
      });
  }, [selectedDistrict, dispatch]);

  const handleCancel = () => setPreviewOpen(false);

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

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <Form
      layout="vertical"
      ref={formRef}
      style={{ width: '100%', padding: '1.5rem' }}
    >
      <EventIdentitySection
        formRef={formRef}
        fileList={fileList}
        setFileList={setFileList}
        previewModal={previewModal}
        uploadProps={uploadProps}
      />

      <EventLocationSection
        eventType={eventType}
        setEventType={setEventType}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        selectedWard={selectedWard}
        setSelectedWard={setSelectedWard}
        cities={cities}
        districts={districts}
        wards={wards}
      />

      <EventCategorySection
        categories={categories}
        selectedCategory={selectedCategory}
      />

      <EventDescriptionSection
        editorHtml={editorHtml}
        setEditorHtml={setEditorHtml}
      />

      <OrganizerInformationSection
        formRef={formRef}
        fileList={fileList}
        setFileList={setFileList}
        previewModal={previewModal}
        uploadProps={uploadProps}
      />
    </Form>
  );
};

export default EventInfoForm;
