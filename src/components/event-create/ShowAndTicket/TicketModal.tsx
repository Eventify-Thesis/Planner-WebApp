// src/components/event-create/ShowAndTicket/TicketModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Checkbox,
  DatePicker,
  Upload,
  Space,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { RcFile } from 'antd/lib/upload';
import { uploadFile } from '@/services/fileUpload.service';
import { TicketModel } from '@/domain/ShowModel';
import dayjs from 'dayjs';
import { DetailModal, ModalForm } from './TicketModal.styles';
import { BASE_COLORS } from '@/styles/themes/constants';

const { TextArea } = Input;

interface TicketModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (ticket: TicketModel) => void;
  showStartTime?: Date;
  showEndTime?: Date;
  initialValues?: TicketModel;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  visible,
  onCancel,
  onSave,
  showStartTime,
  showEndTime,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [isFree, setIsFree] = useState(initialValues?.isFree || false);
  const [imageUrl, setImageUrl] = useState(initialValues?.imageURL || '');

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        startTime: dayjs(initialValues.startTime),
        endTime: dayjs(initialValues.endTime),
      });
      setIsFree(initialValues.isFree || false);
      setImageUrl(initialValues.imageURL || '');
    } else if (visible) {
      form.resetFields();
      setIsFree(false);
      setImageUrl('');
    }
  }, [visible, initialValues, form]);

  const handleUpload = async (file: RcFile) => {
    try {
      const url = await uploadFile(file);
      setImageUrl(url);
      return false;
    } catch (error) {
      console.error('Upload failed:', error);
      return false;
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onSave({
        ...values,
        isFree,
        imageURL: imageUrl,
        position: initialValues?.position || 0,
        startTime: values.startTime.toDate(),
        endTime: values.endTime.toDate(),
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <DetailModal
      title={t('show_and_ticket.ticket_modal.title')}
      open={visible}
      onCancel={onCancel}
      onOk={handleSave}
      okText={t('show_and_ticket.ticket_modal.save')}
      okButtonProps={{
        style: {
          backgroundColor: 'var(--primary-color)',
          borderColor: 'var(--primary-color)',
          color: BASE_COLORS.black,
        },
      }}
      cancelText={t('show_and_ticket.ticket_modal.cancel')}
      cancelButtonProps={{ type: 'default' }}
      width={'70%'}
      style={{
        backgroundColor: 'rgba(81, 81, 88, 0.3)',
      }}
    >
      <ModalForm form={form} layout="vertical">
        <Form.Item
          name="name"
          label={t('show_and_ticket.ticket_modal.name')}
          rules={[
            {
              required: true,
              message: t('show_and_ticket.validation.required'),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Space
          align="baseline"
          style={{
            gap: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Form.Item
              name="price"
              label={t('show_and_ticket.ticket_modal.price')}
              rules={[
                {
                  required: !isFree,
                  message: t('show_and_ticket.validation.required'),
                },
              ]}
            >
              <InputNumber disabled={isFree} min={0} />
            </Form.Item>

            <Checkbox
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
            >
              {t('show_and_ticket.ticket_modal.free')}
            </Checkbox>
          </div>

          <Form.Item
            name="quantity"
            label={t('show_and_ticket.ticket_modal.quantity')}
            rules={[
              {
                required: true,
                message: t('show_and_ticket.validation.required'),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const minPurchase = getFieldValue('minTicketPurchase');
                  const maxPurchase = getFieldValue('maxTicketPurchase');

                  if (!value) return Promise.resolve();

                  if (minPurchase && value < minPurchase) {
                    return Promise.reject(
                      new Error(
                        t(
                          'show_and_ticket.ticket_modal.quantity_min_validation',
                        ),
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="minTicketPurchase"
            label={t('show_and_ticket.ticket_modal.min_purchase')}
            rules={[
              {
                required: true,
                message: t('show_and_ticket.validation.required'),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const maxPurchase = getFieldValue('maxTicketPurchase');
                  if (maxPurchase && value && value > maxPurchase) {
                    return Promise.reject(
                      new Error(
                        t(
                          'show_and_ticket.ticket_modal.min_purchase_validation',
                        ),
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="maxTicketPurchase"
            label={t('show_and_ticket.ticket_modal.max_purchase')}
            rules={[
              {
                required: true,
                message: t('show_and_ticket.validation.required'),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const minPurchase = getFieldValue('minTicketPurchase');
                  if (minPurchase && value && value < minPurchase) {
                    return Promise.reject(
                      new Error(
                        t(
                          'show_and_ticket.ticket_modal.max_purchase_validation',
                        ),
                      ),
                    );
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Space>

        <Space
          style={{ width: '100%', justifyContent: 'space-between', gap: '4%' }}
        >
          <Form.Item
            name="startTime"
            label={t('show_and_ticket.ticket_modal.start_time')}
            rules={[
              {
                required: true,
                message: t('show_and_ticket.validation.required'),
              },
            ]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              disabledDate={(current) => {
                if (!showStartTime || !showEndTime) return false;
                return (
                  current < dayjs(showStartTime) || current > dayjs(showEndTime)
                );
              }}
            />
          </Form.Item>

          <Form.Item
            name="endTime"
            label={t('show_and_ticket.ticket_modal.end_time')}
            rules={[
              {
                required: true,
                message: t('show_and_ticket.validation.required'),
              },
            ]}
            style={{ flex: 1, marginLeft: 8 }}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              disabledDate={(current) => {
                if (!showStartTime || !showEndTime) return false;
                return (
                  current < dayjs(showStartTime) || current > dayjs(showEndTime)
                );
              }}
            />
          </Form.Item>
        </Space>

        <Form.Item
          name="description"
          label={t('show_and_ticket.ticket_modal.description')}
          rules={[
            {
              required: true,
              message: t('show_and_ticket.validation.required'),
            },
            {
              max: 1000,
              message: t('show_and_ticket.validation.max_length', {
                max: 1000,
              }),
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder={t(
              'show_and_ticket.ticket_modal.description_placeholder',
            )}
          />
        </Form.Item>

        <Form.Item
          label={t('show_and_ticket.ticket_modal.image')}
          name="image"
          rules={[
            {
              required: true,
              message: t('show_and_ticket.validation.required'),
            },
          ]}
        >
          <Upload
            listType="picture-card"
            multiple={false}
            maxCount={1}
            beforeUpload={handleUpload}
            fileList={
              imageUrl ? [{ uid: '-1', url: imageUrl, status: 'done' }] : []
            }
          >
            {!imageUrl && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>
                  {t('show_and_ticket.ticket_modal.upload')}
                </div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </ModalForm>
    </DetailModal>
  );
};
