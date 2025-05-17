import React, { useState } from 'react';
import { FormStepProps } from '../types';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';
// Mantine imports
import {
  Box,
  LoadingOverlay,
  Modal,
  Paper,
  Text,
  Title,
  Divider,
  Flex,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { City, District, Ward } from '@/api/locations.api';
import { useTranslation } from 'react-i18next';
import { Category } from '@/api/categories.api';
import { EventType } from '@/constants/enums/event';
import { useParams } from 'react-router-dom';
// We'll use Mantine notifications instead of the controller
// import { notificationController } from '@/controllers/notificationController';
import { EventIdentitySection } from './sections/EventIdentitySection';
import { EventLocationSection } from './sections/EventLocationSection';
import { EventCategorySection } from './sections/EventCategorySection';
import { EventDescriptionSection } from './sections/EventDescriptionSection';
import { OrganizerInformationSection } from './sections/OrganizerInformationSection';
import { transformFile } from '@/utils/utils';
import { safeSetFormValue, safeSetFormValues } from '@/utils/formUtils';
import {
  useGetCities,
  useGetDistricts,
  useGetWards,
} from '@/queries/useLocationQueries';
import { useGetCategories } from '@/queries/useCategoryQueries';
import { useGetEventDetail } from '@/queries/useGetEventDetail';
import { useForm } from '@mantine/form';

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
  const form = useForm({
    initialValues: {
      eventLogoUrl: undefined,
      category: undefined,
      eventType: undefined,
      eventBannerUrl: undefined,
      eventDescription: undefined,
      address: undefined,
      cityId: undefined,
      districtId: undefined,
      wardId: undefined,
      eventCategory: undefined,
      eventOrganizerName: undefined,
      orgName: undefined,
      orgDescription: undefined,
      orgLogoUrl: undefined,
    },
  });

  React.useEffect(() => {
    if (formRef) {
      formRef.current = form;
    }
  }, [formRef, form]);

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
      safeSetFormValue(formRef, 'category', category);
      setEventType(eventDetail.eventType);

      safeSetFormValue(formRef, 'category', category);
      setEditorHtml(eventDetail.eventDescription);
      safeSetFormValues(formRef, {
        ...eventDetail,
        category,
      });

      safeSetFormValue(formRef, 'orgName', eventDetail.orgName);
      safeSetFormValue(formRef, 'orgDescription', eventDetail.orgDescription);
      safeSetFormValue(formRef, 'orgLogoUrl', eventDetail.orgLogoUrl);

      setFileList({
        logo: transformFile(eventDetail.eventLogoUrl, 'logo'),
        banner: transformFile(eventDetail.eventBannerUrl, 'banner'),
        organizerLogo: transformFile(eventDetail.orgLogoUrl, 'organizerLogo'),
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
      if (!isImage)
        notifications.show({
          title: 'Error',
          message: t('event_create.image_only'),
          color: 'red',
        });
      return isImage;
    },
    listType: 'picture-card',
    multiple: false,
    accept: 'image/*',
    onPreview: handlePreview,
  });

  const previewModal = (
    <Modal
      opened={previewOpen}
      onClose={handleCancel}
      title={previewTitle}
      centered
      size="lg"
    >
      <img
        alt="preview"
        style={{ width: '100%', borderRadius: '8px' }}
        src={previewImage}
      />
    </Modal>
  );

  if (isEventLoading || isCitiesLoading || isCategoriesLoading) {
    return (
      <Box
        py={60}
        pos="relative"
        h={500}
        w="100%"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <LoadingOverlay
          visible={true}
          loaderProps={{ size: 'xl', color: 'blue', variant: 'dots' }}
          overlayProps={{ blur: 4, opacity: 0.3, color: '#f8faff' }}
        />
        <Text size="lg" fw={500} color="dimmed">
          Loading Event Information...
        </Text>
      </Box>
    );
  }

  return (
    <Box
      ref={formRef}
      w="100%"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        maxWidth: '100%',
      }}
    >
      <EventIdentitySection
        form={form}
        fileList={fileList}
        setFileList={setFileList}
        previewModal={previewModal}
        uploadProps={uploadProps}
      />

      <EventLocationSection
        form={form}
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
        form={form}
        categories={categories}
      />

      <EventDescriptionSection
        form={form}
        editorHtml={editorHtml}
        setEditorHtml={setEditorHtml}
      />

      <OrganizerInformationSection
        form={form}
        fileList={fileList}
        setFileList={setFileList}
        previewModal={previewModal}
        uploadProps={uploadProps}
      />

      <Flex justify="flex-end" mt="xl">
        <Box style={{ height: 20 }} /> {/* Spacer for bottom margin */}
      </Flex>
    </Box>
  );
};

export default EventInfoForm;
