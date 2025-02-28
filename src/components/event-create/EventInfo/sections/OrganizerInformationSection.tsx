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

interface OrganizerInformationSectionProps {
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

const handleOrganizerLogoUpload = async (
  fileList: UploadFile[],
  setFileList: OrganizerInformationSectionProps['setFileList'],
  formRef: React.RefObject<any>
) => {
  setFileList((prevFileList) => ({
    ...prevFileList,
    organizerLogo: fileList,
  }));

  if (fileList[0]?.originFileObj) {
    const url = await uploadFile(fileList[0].originFileObj as RcFile);
    formRef.current?.setFieldsValue({
      orgLogoURL: url,
    });
  }
};

export const OrganizerInformationSection: React.FC<OrganizerInformationSectionProps> = ({
  formRef,
  fileList,
  setFileList,
  previewModal,
  uploadProps,
}) => {
  const { t } = useTranslation();

  return (
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
            onChange={({ fileList }) =>
              handleOrganizerLogoUpload(fileList, setFileList, formRef)
            }
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
                message: t('event_create.organizer_information.name_required'),
              },
            ]}
          >
            <Input placeholder={t('event_create.organizer_information.name')} />
          </Form.Item>

          <Form.Item
            label={t('event_create.organizer_information.information')}
            name="orgDescription"
            rules={[
              {
                required: true,
                message: t('event_create.organizer_information.info_required'),
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder={t('event_create.organizer_information.information')}
            />
          </Form.Item>
        </BaseCol>
      </BaseRow>
    </S.FormSection>
  );
};
