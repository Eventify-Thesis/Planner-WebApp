import React, { useState } from 'react';
import { Form, message, Modal, Spin } from 'antd';
import { FormStepProps } from '../types';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
import { City, District, Ward } from '@/api/locations.api';
import { useTranslation } from 'react-i18next';
import { Category } from '@/api/categories.api';
import { EventType } from '@/constants/enums/event';
import { useParams } from 'react-router-dom';
import { notificationController } from '@/controllers/notificationController';
import { EventIdentitySection } from './sections/EventIdentitySection';
import { EventLocationSection } from './sections/EventLocationSection';
import { EventCategorySection } from './sections/EventCategorySection';
import { EventDescriptionSection } from './sections/EventDescriptionSection';
import { OrganizerInformationSection } from './sections/OrganizerInformationSection';
import { transformFile } from '@/utils/utils';
import {
  useGetCities,
  useGetDistricts,
  useGetWards,
} from '@/queries/useLocationQueries';
import { useGetCategories } from '@/queries/useCategoryQueries';
import { useGetEventDetail } from '@/queries/useGetEventDetail';

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const EventInfoForm: React.FC<FormStepProps> = ({ formRef }) => {
  const { t } = useTranslation();
  const { eventId } = useParams<{ eventId?: string }>();

  const [eventType, setEventType] = useState(EventType.OFFLINE);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [editorHtml, setEditorHtml] = useState('');

  const [fileList, setFileList] = useState<{
    logo: UploadFile[];
    banner: UploadFile[];
    organizerLogo: UploadFile[];
  }>({
    logo: [],
    banner: [],
    organizerLogo: [],
  });

  // React Query hooks
  const { data: cities = [], isLoading: isCitiesLoading } = useGetCities();
  const { data: districts = [], isLoading: isDistrictsLoading } =
    useGetDistricts(selectedCity);
  const { data: wards = [], isLoading: isWardsLoading } =
    useGetWards(selectedDistrict);
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useGetCategories();
  const { data: eventDetail, isLoading: isEventLoading } =
    useGetEventDetail(eventId);

  // Set form data when event detail is loaded
  React.useEffect(() => {
    if (eventDetail && formRef.current) {
      const category =
        eventDetail.categoriesIds[0] + '_' + eventDetail.categories[0];
      setSelectedCategory(category);
      setEventType(eventDetail.eventType);

      formRef.current.setFieldsValue({
        ...eventDetail,
        category,
      });
      setEditorHtml(eventDetail.eventDescription);

      setFileList({
        logo: transformFile(eventDetail.eventLogoURL, 'logo'),
        banner: transformFile(eventDetail.eventBannerURL, 'banner'),
        organizerLogo: transformFile(eventDetail.orgLogoURL, 'organizerLogo'),
      });
    }
  }, [eventDetail, formRef]);

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

  if (isEventLoading || isCitiesLoading || isCategoriesLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}
      >
        <Spin size="large" />
      </div>
    );
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
        isDistrictsLoading={isDistrictsLoading}
        isWardsLoading={isWardsLoading}
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
