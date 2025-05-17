import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  TextInput,
  Text,
  Box,
  Paper,
  Image,
  ActionIcon,
} from '@mantine/core';
import { IconUsers, IconBuildingSkyscraper } from '@tabler/icons-react';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
import { IconUpload, IconX } from '@tabler/icons-react';
import type { UploadFile } from 'antd/es/upload/interface'; // Needed for compatibility
import type { RcFile } from 'antd/es/upload'; // Needed for the uploadFile service
import { uploadFile } from '@/services/fileUpload.service';
import { transformFile } from '@/utils/utils';
import { FormSection } from '../components/FormSection';
import classes from './OrganizerInformationSection.module.css';
import { getFormValue, safeSetFormValue } from '@/utils/formUtils';

interface OrganizerInformationSectionProps {
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
  previewModal: JSX.Element;
  uploadProps: () => {
    beforeUpload: (file: File) => boolean;
    listType: string;
    multiple: boolean;
    accept: string;
    onPreview: (file: UploadFile) => Promise<void>;
  };
}

const handleOrganizerLogoUpload = async (
  files: FileWithPath[],
  setFileList: OrganizerInformationSectionProps['setFileList'],
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
      // Update form value appropriately based on available methods
      form.values.orgLogoUrl = url;

      // Update the file list with the new URL
      setFileList((prevFileList) => ({
        ...prevFileList,
        organizerLogo: transformFile(url, 'organizerLogo'),
      }));
    }
  } catch (error) {
    console.error(`Error uploading organizer logo:`, error);
  }
};

// Helper function to remove an image
const removeOrganizerLogo = (
  setFileList: OrganizerInformationSectionProps['setFileList'],
  form: any,
) => {
  setFileList((prevState) => ({ ...prevState, organizerLogo: [] }));

  // Update form value
  if (form) {
    form.values.orgLogoUrl = '';
  }
};

export const OrganizerInformationSection: React.FC<
  OrganizerInformationSectionProps
> = ({ form, fileList, setFileList, previewModal, uploadProps }) => {
  const { t } = useTranslation();


  return (
    <FormSection
      title={t('event_create.organizer_information.title')}
      icon={<IconBuildingSkyscraper size={22} />}
      colorAccent="accent1"
      subtitle={
        'Provide information about the organization or individual hosting this event.'
      }
      badge="Organizer"
    >
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="md" radius="md" mb="lg">
            <Grid gutter="md">
              <Grid.Col span={12}>
                <TextInput
                  label={
                    <>
                      {t('event_create.organizer_information.name')}
                      <Text span c="red" ml={4}>
                        *
                      </Text>
                    </>
                  }
                  name="orgName"
                  placeholder={t(
                    'event_create.organizer_information.name_placeholder',
                  )}
                  required
                  classNames={{ input: classes.inputField }}
                  {...form.getInputProps('orgName')}
                />
              </Grid.Col>

              <Grid.Col span={12}>
                <Box mb="md">
                  <Text fw={500} mb="xs">
                    {t('event_create.organizer_information.information')}
                    <Text span c="red" ml={4}>
                      *
                    </Text>
                  </Text>
                  <textarea
                    name="orgDescription"
                    className={classes.textArea}
                    rows={4}
                    placeholder={t(
                      'event_create.organizer_information.information',
                    )}
                    {...form.getInputProps('orgDescription')}
                  />
                </Box>
              </Grid.Col>
            </Grid>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="md" radius="md" mb="lg">
            <Text fw={500} mb="md">
              {t('event_create.organizer_information.logo')}
              <Text span c="red" ml={4}>
                *
              </Text>
            </Text>
            {fileList['organizerLogo']?.length > 0 ? (
              <Box className={classes.previewContainer}>
                <Image
                  src={fileList['organizerLogo'][0]?.url}
                  alt="Organizer Logo"
                  className={classes.previewImage}
                />
                <Box className={classes.previewOverlay}>
                  <ActionIcon
                    variant="filled"
                    color="red"
                    onClick={() => removeOrganizerLogo(setFileList, form)}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Box>
              </Box>
            ) : (
              <Dropzone
                onDrop={(files) =>
                  handleOrganizerLogoUpload(files, setFileList, form)
                }
                maxSize={2 * 1024 * 1024} // 2MB
                accept={{ 'image/*': [] }}
                className={classes.uploadContainer}
              >
                <Box className={classes.uploadContent}>
                  <Box className={classes.uploadIcon}>
                    <IconUpload size={30} stroke={1.5} />
                  </Box>
                  <Text fw={600} size="sm" c="blue.7" mb={8}>
                    {t('event_create.organizer_information.upload_logo')}
                  </Text>
                  <Text size="xs" c="dimmed" ta="center">
                    {t('event_create.organizer_information.logo_description') ||
                      'Upload organization logo'}
                  </Text>
                </Box>
              </Dropzone>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
      {previewModal}
    </FormSection>
  );
};
