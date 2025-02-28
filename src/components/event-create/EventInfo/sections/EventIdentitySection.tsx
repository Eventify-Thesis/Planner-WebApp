import React from 'react';
import { Form, Input, Upload } from 'antd';
import { BaseRow } from '@/components/common/BaseRow/BaseRow';
import { BaseCol } from '@/components/common/BaseCol/BaseCol';
import { useTranslation } from 'react-i18next';
import type { UploadFile } from 'antd/es/upload/interface';
import * as S from '../EventInfoForm.styles';
import { UploadIcon } from '../components/UploadIcon';
import { uploadFile } from '@/services/fileUpload.service';
import type { RcFile } from 'antd/es/upload';

interface EventIdentitySectionProps {
  formRef: React.RefObject<any>;
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

const handleFileUpload = async (
  fileList: UploadFile[],
  setFileList: EventIdentitySectionProps['setFileList'],
  fieldName: string,
  formRef: React.RefObject<any>,
) => {
  setFileList((prevFileList) => ({
    ...prevFileList,
    [fieldName]: fileList,
  }));

  if (fileList[0]?.originFileObj) {
    const url = await uploadFile(fileList[0].originFileObj as RcFile);
    formRef.current?.setFieldsValue({
      [`event${fieldName[0].toUpperCase() + fieldName.slice(1)}URL`]: url,
    });
  }
};

export const EventIdentitySection: React.FC<EventIdentitySectionProps> = ({
  formRef,
  fileList,
  setFileList,
  previewModal,
  uploadProps,
}) => {
  const { t } = useTranslation();

  return (
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
              onChange={({ fileList }) =>
                handleFileUpload(fileList, setFileList, 'logo', formRef)
              }
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
          >
            <Upload
              {...uploadProps()}
              onChange={({ fileList }) =>
                handleFileUpload(fileList, setFileList, 'banner', formRef)
              }
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
  );
};
