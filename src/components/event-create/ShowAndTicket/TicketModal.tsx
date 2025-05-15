// src/components/event-create/ShowAndTicket/TicketModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Text,
  TextInput,
  Checkbox,
  Textarea,
  Button,
  Title,
  Image,
  Flex,
  ActionIcon,
} from '@mantine/core';
import { Form, InputNumber, DatePicker, Upload } from 'antd'; // Keep Ant DatePicker
import { IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { RcFile } from 'antd/lib/upload';
import { uploadFile } from '@/services/fileUpload.service';
import { TicketTypeModel } from '@/domain/TicketTypeModel';
import dayjs from 'dayjs';
import classes from './TicketModal.module.css';

interface TicketModalProps {
  visible: boolean;
  onCancel: () => void;
  onSave: (ticket: TicketTypeModel) => void;
  showStartTime?: Date;
  showEndTime?: Date;
  initialValues?: TicketTypeModel;
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
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl || '');

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        ...initialValues,
        startTime: dayjs(initialValues.startTime),
        endTime: dayjs(initialValues.endTime),
      });
      setIsFree(initialValues.isFree || false);
      setImageUrl(initialValues.imageUrl || '');
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
        imageUrl: imageUrl,
        position: initialValues?.position || 0,
        startTime: values.startTime.toDate(),
        endTime: values.endTime.toDate(),
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      opened={visible}
      onClose={onCancel}
      size="xl"
      withCloseButton={false}
      closeOnClickOutside={true}
      closeOnEscape={true}
      classNames={{
        root: classes.modalRoot,
        content: classes.modalContent,
        inner: classes.modalInner,
        body: classes.modalBody,
      }}
      centered
      lockScroll
      trapFocus
    >
      <Box className={classes.modalHeader}>
        <Title order={4} className={classes.modalTitle}>
          {t('show_and_ticket.ticket_modal.title')}
        </Title>
        <ActionIcon
          onClick={onCancel}
          className={classes.closeButton}
          aria-label="Close modal"
        >
          <IconX size={20} />
        </ActionIcon>
      </Box>
      <Box className={classes.modalForm}>
        <Form form={form} layout="vertical">
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
            <TextInput
              placeholder={t('show_and_ticket.ticket_modal.name_placeholder')}
              styles={{ root: { width: '100%' } }}
            />
          </Form.Item>

          <Flex gap="md" wrap="wrap">
            <Box className={classes.priceGroup}>
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
                <InputNumber
                  disabled={isFree}
                  min={0}
                  style={{ width: '120px' }}
                />
              </Form.Item>

              <Checkbox
                checked={isFree}
                onChange={(e) => setIsFree(e.currentTarget.checked)}
                label={t('show_and_ticket.ticket_modal.free')}
              />
            </Box>

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
          </Flex>

          <Flex gap="md" justify="space-between" mb="md">
            <Form.Item
              name="startTime"
              label={t('show_and_ticket.ticket_modal.start_time')}
              rules={[
                {
                  required: true,
                  message: t('show_and_ticket.validation.required'),
                },
              ]}
              style={{ flex: 1 }}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                disabledDate={(current) => {
                  if (!showStartTime || !showEndTime) return false;
                  return (
                    current < dayjs(showStartTime) ||
                    current > dayjs(showEndTime)
                  );
                }}
                popupStyle={{ zIndex: 1500 }}
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
              style={{ flex: 1 }}
            >
              <DatePicker
                showTime
                style={{ width: '100%' }}
                disabledDate={(current) => {
                  if (!showStartTime || !showEndTime) return false;
                  return (
                    current < dayjs(showStartTime) ||
                    current > dayjs(showEndTime)
                  );
                }}
                popupStyle={{ zIndex: 1500 }}
              />
            </Form.Item>
          </Flex>

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
            <Textarea
              minRows={4}
              placeholder={t(
                'show_and_ticket.ticket_modal.description_placeholder',
              )}
              styles={{ input: { width: '100%' } }}
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
            <Box>
              {imageUrl ? (
                <Box style={{ position: 'relative', display: 'inline-block' }}>
                  <Image
                    src={imageUrl}
                    alt="Ticket image"
                    radius="sm"
                    className={classes.imagePreview}
                  />
                  <Box
                    className={classes.deleteButton}
                    onClick={() => setImageUrl('')}
                  >
                    <IconTrash size={12} />
                  </Box>
                </Box>
              ) : (
                <Upload
                  listType="picture-card"
                  multiple={false}
                  maxCount={1}
                  beforeUpload={handleUpload}
                  fileList={[]}
                  showUploadList={false}
                >
                  <Box className={classes.uploadButton}>
                    <IconUpload className={classes.uploadIcon} size={24} />
                    <Text className={classes.uploadText}>
                      {t('show_and_ticket.ticket_modal.upload')}
                    </Text>
                  </Box>
                </Upload>
              )}
            </Box>
          </Form.Item>

          <Flex justify="flex-end" gap="md" mt="xl">
            <Button variant="subtle" onClick={onCancel}>
              {t('show_and_ticket.ticket_modal.cancel')}
            </Button>
            <Button onClick={handleSave} color="blue">
              {t('show_and_ticket.ticket_modal.save')}
            </Button>
          </Flex>
        </Form>
      </Box>
    </Modal>
  );
};
