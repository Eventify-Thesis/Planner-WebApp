import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  TextInput,
  Text,
  Box,
  Paper,
  Group,
  Image,
  ActionIcon,
} from '@mantine/core';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { IconPhoto, IconFileUpload, IconX, IconId } from '@tabler/icons-react';
import type { UploadFile } from 'antd/es/upload/interface'; // Needed for compatibility
// Import only what we need for type definitions
import { uploadFile } from '@/services/fileUpload.service';
import { transformFile } from '@/utils/utils';
import { FormSection } from '../components/FormSection';
import { getFormValue, safeSetFormValue } from '@/utils/formUtils';
import classes from './EventIdentitySection.module.css';

interface EventIdentitySectionProps {
  form: any;
  fileList: {
    logo: UploadFile[];
    banner: UploadFile[];
    organizerLogo: UploadFile[];
  };
  setFileList: React.Dispatch<
    React.SetStateAction<{
      logo: UploadFile[];
      banner: UploadFile[];
      organizerLogo: UploadFile[];
    }>
  >;
  previewModal: React.ReactNode;
  uploadProps: () => any; // Using any temporarily to resolve type issues
}

const handleFileUpload = async (
  files: FileWithPath[],
  setFileList: EventIdentitySectionProps['setFileList'],
  fieldName: string,
  form: any,
) => {
  // Skip if no files
  if (!files || files.length === 0) return;

  // Get the uploaded file from the array
  const file = files[0];
  if (!file) return;

  try {
    // Upload file and get back the URL
    const url = await uploadFile(file as any);

    if (url) {
      // Instead of using formRef.setFieldsValue which doesn't exist in this context,
      // we directly update the formRef value if it's a simple value property
      // This matches the expected behavior without relying on the Ant form API
      if (form) {
        if (fieldName === 'logo') {
          form.values.eventLogoUrl = url;
        } else if (fieldName === 'banner') {
          form.values.eventBannerUrl = url;
        }
      }

      // Update the file list with the new URL
      setFileList((prevFileList) => ({
        ...prevFileList,
        [fieldName]: transformFile(url, fieldName),
      }));
    }
  } catch (error) {
    console.error(`Error uploading ${fieldName}:`, error);
  }
};

// Helper function to remove an image
const removeImage = (
  setFileList: EventIdentitySectionProps['setFileList'],
  fieldName: string,
  form: any,
) => {
  setFileList((prevState) => ({ ...prevState, [fieldName]: [] }));

  // Use our safe utility function
  safeSetFormValue(form, fieldName, '');
};

export const EventIdentitySection: React.FC<EventIdentitySectionProps> = ({
  form,
  fileList,
  setFileList,
  previewModal,
}) => {
  const { t } = useTranslation();

  return (
    <FormSection
      title={t('event_create.event_identity.title')}
      icon={<IconId size={22} />}
      colorAccent="accent1"
      subtitle={t('event_create.event_identity.description')}
      badge={t('event_create.event_identity.title')}
    >
      <Grid gutter="xl" mb="lg">
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Box mb="xs">
            <Text fw={600} size="sm" c="dark" mb={4}>
              {t('event_create.event_identity.logo')}
              <Text span c="red" ml={4}>
                *
              </Text>
            </Text>
            <Text size="xs" c="dimmed">
              {t('event_create.event_identity.logo_format_hint')}
            </Text>
          </Box>
          {fileList['logo']?.length > 0 ? (
            <Box className={classes.previewContainer}>
              <Image
                src={fileList['logo'][0]?.url}
                alt="Logo"
                className={classes.previewImage}
              />
              <Box className={classes.previewOverlay}>
                <ActionIcon
                  variant="filled"
                  color="red"
                  onClick={() => removeImage(setFileList, 'logo', form)}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Box>
            </Box>
          ) : (
            <Dropzone
              onDrop={(files) =>
                handleFileUpload(files, setFileList, 'logo', form)
              }
              maxSize={10 * 1024 * 1024} // 2MB
              accept={{ 'image/*': [] }}
              className={classes.uploadContainer}
              style={{ minHeight: '160px' }}
            >
              <Box className={classes.uploadContent}>
                <Box className={classes.uploadIcon}>
                  <IconPhoto size={42} stroke={1.5} />
                </Box>
                <Text fw={600} size="sm" c="blue.7" mb={8}>
                  {t('event_create.event_identity.upload_logo')}
                </Text>
                <Text size="xs" c="dimmed" ta="center" lh={1.5}>
                  {t('event_create.event_identity.dropzone_instructions')}
                  <br />
                  {t('event_create.event_identity.dropzone_formats', { size: 2 })}
                  <br />
                  <Text span c="blue.6" fw={500} size="xs">
                    {t('event_create.event_identity.recommended_size', { dimensions: '400×400px' })}
                  </Text>
                </Text>
              </Box>
            </Dropzone>
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 9 }}>
          <Box mb="xs">
            <Text fw={600} size="sm" c="dark" mb={4}>
              {t('event_create.event_identity.banner')}
              <Text span c="red" ml={4}>
                *
              </Text>
            </Text>
            <Text size="xs" c="dimmed">
              {t('event_create.event_identity.banner_format_hint')}
            </Text>
          </Box>
          {fileList['banner']?.length > 0 ? (
            <Box className={classes.previewContainer}>
              <Image
                src={fileList['banner'][0]?.url}
                alt="Banner"
                className={classes.previewImage}
              />
              <Box className={classes.previewOverlay}>
                <ActionIcon
                  variant="filled"
                  color="red"
                  onClick={() => removeImage(setFileList, 'banner', form)}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Box>
            </Box>
          ) : (
            <Dropzone
              onDrop={(files) =>
                handleFileUpload(files, setFileList, 'banner', form)
              }
              maxSize={3 * 1024 * 1024} // 3MB
              accept={{ 'image/*': [] }}
              className={classes.uploadContainer}
              style={{ minHeight: '160px' }}
            >
              <Box className={classes.uploadContent}>
                <Box className={classes.uploadIcon}>
                  <IconFileUpload size={42} stroke={1.5} />
                </Box>
                <Text fw={600} size="sm" c="blue.7" mb={8}>
                  {t('event_create.event_identity.upload_banner')}
                </Text>
                <Text size="xs" c="dimmed" ta="center" lh={1.5}>
                  {t('event_create.event_identity.banner_dropzone_instructions')}
                  <br />
                  {t('event_create.event_identity.dropzone_formats', { size: 3 })}
                  <br />
                  <Text span c="blue.6" fw={500} size="xs">
                    {t('event_create.event_identity.recommended_size', { dimensions: '1200×675px' })}
                  </Text>
                </Text>
              </Box>
            </Dropzone>
          )}
        </Grid.Col>
      </Grid>

      <Paper
        shadow="sm"
        p="xl"
        mt="xl"
        mb="md"
        radius="md"
        withBorder
        style={{
          borderLeft: '4px solid #3d8bfd',
          background: 'linear-gradient(145deg, #f0f7ff 0%, #f8faff 100%)',
          transition: 'all 0.3s ease',
        }}
      >
        <Text fw={600} size="sm" mb="xs">
          {t('event_create.event_identity.event_details')}
        </Text>
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label={t('event_create.event_identity.name')}
              name="eventName"
              placeholder={
                t('event_create.event_identity.name_placeholder') ||
                'Enter your event name'
              }
              required
              classNames={{ input: classes.textInput }}
              styles={{
                label: {
                  fontWeight: 600,
                  marginBottom: '6px',
                  fontSize: '14px',
                },
                input: {
                  padding: '12px 16px',
                  height: 'auto',
                  '&:focus': {
                    borderColor: '#4285f4',
                    boxShadow: '0 0 0 3px rgba(66, 133, 244, 0.15)',
                  },
                },
              }}
              {...form.getInputProps('eventName')}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              label={t('event_create.event_identity.abbrName')}
              name="eventAbbrName"
              placeholder={
                t('event_create.event_identity.abbrName_placeholder') ||
                'Short name or abbreviation'
              }
              classNames={{ input: classes.textInput }}
              styles={{
                label: {
                  fontWeight: 600,
                  marginBottom: '6px',
                  fontSize: '14px',
                },
                input: {
                  padding: '12px 16px',
                  height: 'auto',
                  '&:focus': {
                    borderColor: '#4285f4',
                    boxShadow: '0 0 0 3px rgba(66, 133, 244, 0.15)',
                  },
                },
              }}
              s
              {...form.getInputProps('eventAbbrName')}
            />
          </Grid.Col>
        </Grid>
      </Paper>
      {previewModal}
    </FormSection>
  );
};
