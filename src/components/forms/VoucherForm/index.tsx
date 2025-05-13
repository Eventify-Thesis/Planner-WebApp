import { UseFormReturnType } from '@mantine/form';
import {
  Alert,
  NumberInput,
  TextInput,
  Stack,
  Title,
  Radio,
  Group,
  Switch,
  Button,
  Tabs,
  Text,
  Paper,
  Container,
  Grid,
} from '@mantine/core';
import { DatePicker, Form } from 'antd';
import dayjs from 'dayjs';
import {
  IconAlertCircle,
  IconPercentage,
  IconTicket,
  IconSettings,
  IconTarget,
} from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { LoadingMask } from '../../common/LoadingMask';
import { InputGroup } from '../../common/InputGroup';
import { getCurrencySymbol } from '@/utils/currency.ts';
import { useTranslation } from 'react-i18next';
import { VoucherDiscountType, VoucherModel } from '@/domain/VoucherModel';
import { useState, useEffect } from 'react';
import { useGetEventShow } from '@/queries/useGetEventShow';
import { useGetEvent } from '@/queries/useGetEvent';
import { ShowSelectionModal } from './ShowSelectionModal';
import { ShowCard } from './ShowCard';
import './VoucherForm.css';

interface VoucherFormProps {
  form: UseFormReturnType<VoucherModel>;
}

export const VoucherForm = ({ form }: VoucherFormProps) => {
  const { eventId } = useParams();
  const { t } = useTranslation();
  const { data: event } = useGetEvent(eventId);
  const { data: shows } = useGetEventShow(eventId);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedShows, setSelectedShows] = useState<any[]>([]);
  const [ticketCreationType, setTicketCreationType] = useState<
    'single' | 'bulk'
  >('single');

  // Update form validation based on ticket type
  useEffect(() => {
    if (ticketCreationType === 'single') {
      form.setFieldValue('bulkCodePrefix', '');
      form.setFieldValue('bulkCodeNumber', 0);
    } else {
      form.setFieldValue('discountCode', '');
    }
  }, [ticketCreationType]);

  const handleShowSelect = (show: any) => {
    const newSelectedShows = [...selectedShows, show];
    setSelectedShows(newSelectedShows);
    updateFormShowings(newSelectedShows);
  };

  const handleShowRemove = (showId: number) => {
    const newSelectedShows = selectedShows.filter((show) => show.id !== showId);
    setSelectedShows(newSelectedShows);
    updateFormShowings(newSelectedShows);
  };

  const handleTicketSelectionChange = (
    showId: number,
    isAllTicketTypes: boolean,
    selectedTickets: string[],
  ) => {
    const updatedShows = selectedShows.map((show) =>
      show.id === showId
        ? {
            ...show,
            isAllTickets: isAllTicketTypes,
            selectedTicketTypes: selectedTickets,
          }
        : show,
    );
    setSelectedShows(updatedShows);
    updateFormShowings(updatedShows);
  };

  const updateFormShowings = (shows: any[]) => {
    const showings = shows.map((show) => ({
      id: show.id,
      isAllTicketTypes: show.isAllTicketTypes ?? true,
      ticketTypeIds: (
        show.selectedTicketTypes ?? show.ticketTypes.map((t: any) => t.id)
      )
        .filter((id: string) => id && typeof id === 'string')
        .map((id: string) => id.toString()),
    }));
    form.setFieldValue('showingConfigs', showings);
  };

  const DiscountIcon = () => {
    if (form.values.discountType === VoucherDiscountType.PERCENT) {
      return <IconPercentage />;
    }
    return getCurrencySymbol('VND');
  };

  if (!event) {
    return <LoadingMask />;
  }

  return (
    <Container
      size="lg"
      className="voucher-form"
      style={{
        padding: 0,
      }}
    >
      <Stack gap="xl">
        <Paper shadow="sm" p="md" className="form-section">
          <Tabs
            value={ticketCreationType}
            onChange={(value) =>
              setTicketCreationType(value as 'single' | 'bulk')
            }
            variant="pills"
            className="tabs-container"
          >
            <Tabs.List>
              <Tabs.Tab value="single" leftSection={<IconTicket size={16} />}>
                {t('voucher.single_ticket')}
              </Tabs.Tab>
              <Tabs.Tab value="bulk" leftSection={<IconTicket size={16} />}>
                {t('voucher.bulk_tickets')}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="single" pt="xl">
              <div>
                <Title order={4} className="section-title">
                  {t('voucher.basic_information')}
                </Title>
                <Stack gap="md">
                  <TextInput
                    {...form.getInputProps('name')}
                    label={t('voucher.name')}
                    placeholder={t('voucher.name_placeholder')}
                    description="Program name will not be displayed to customers"
                    required
                  />
                  <TextInput
                    {...form.getInputProps('discountCode')}
                    label={t('voucher.discount_code')}
                    placeholder={t('voucher.discount_code_placeholder')}
                    description="Only uppercase letters (A-Z) and numbers (0-9) are allowed, length 6-12 characters"
                    pattern="[A-Z0-9]{6,12}"
                    required={ticketCreationType === 'single'}
                  />

                  <Grid gutter="md">
                    <Grid.Col span={6}>
                      <Form.Item label={t('voucher.start_time')} required>
                        <DatePicker
                          value={
                            form.values.startTime
                              ? dayjs(form.values.startTime)
                              : null
                          }
                          showTime
                          format="DD/MM/YYYY HH:mm"
                          placeholder={t('voucher.start_time_placeholder')}
                          style={{ width: '100%' }}
                          onChange={(date) =>
                            form.setFieldValue(
                              'startTime',
                              date?.toDate() || null,
                            )
                          }
                        />
                      </Form.Item>
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Form.Item label={t('voucher.end_time')} required>
                        <DatePicker
                          value={
                            form.values.endTime
                              ? dayjs(form.values.endTime)
                              : null
                          }
                          showTime
                          format="DD/MM/YYYY HH:mm"
                          placeholder={t('voucher.end_time_placeholder')}
                          style={{ width: '100%' }}
                          disabledDate={(current) => {
                            const startTime = form.values.startTime;
                            return startTime
                              ? current && current < dayjs(startTime)
                              : false;
                          }}
                          onChange={(date) =>
                            form.setFieldValue(
                              'endTime',
                              date?.toDate() || null,
                            )
                          }
                        />
                      </Form.Item>
                    </Grid.Col>
                  </Grid>
                </Stack>
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="bulk" pt="xl">
              <div>
                <Title order={4} className="section-title">
                  {t('voucher.basic_information')}
                </Title>
                <Stack gap="md">
                  <TextInput
                    {...form.getInputProps('name')}
                    label={t('voucher.name')}
                    placeholder={t('voucher.name_placeholder')}
                    description="Program name will not be displayed to customers"
                    required
                  />
                  <TextInput
                    {...form.getInputProps('bulkCodePrefix')}
                    label={t('voucher.bulk_code_prefix')}
                    placeholder={t('voucher.bulk_code_prefix_placeholder')}
                    required={ticketCreationType === 'bulk'}
                  />
                  <NumberInput
                    {...form.getInputProps('bulkCodeNumber')}
                    label={t('voucher.bulk_code_number')}
                    placeholder={t('voucher.bulk_code_number_placeholder')}
                    min={1}
                    required={ticketCreationType === 'bulk'}
                  />
                </Stack>
              </div>
            </Tabs.Panel>
          </Tabs>
        </Paper>

        <Paper shadow="sm" p="md" className="form-section">
          <Title
            order={4}
            className="section-title"
            leftSection={<IconSettings size={20} />}
          >
            {t('voucher.set_up_voucher')}
          </Title>
          <Stack gap="md">
            <InputGroup>
              <div>
                <Text size="sm" fw={500} mb="xs">
                  {t('voucher.discount_type')}
                </Text>
                <Radio.Group {...form.getInputProps('discountType')} required>
                  <Group mt="xs">
                    <Radio
                      value={VoucherDiscountType.PERCENT}
                      label={t('voucher.discount_type_percent')}
                    />
                    <Radio
                      value={VoucherDiscountType.FIXED}
                      label={t('voucher.discount_type_fixed')}
                    />
                  </Group>
                </Radio.Group>
              </div>
              <NumberInput
                {...form.getInputProps('discountValue')}
                label={t('voucher.discount_value')}
                min={0}
                max={
                  form.values.discountType === VoucherDiscountType.PERCENT
                    ? 100
                    : undefined
                }
                leftSection={<DiscountIcon />}
              />
            </InputGroup>

            <Switch
              {...form.getInputProps('isUnlimited', { type: 'checkbox' })}
              label={t('voucher.unlimited_quantity')}
            />

            {!form.values.isUnlimited && (
              <NumberInput
                {...form.getInputProps('quantity')}
                label={t('voucher.quantity')}
                placeholder={t('voucher.quantity_placeholder')}
                description="Total number of times this voucher can be used"
                min={1}
              />
            )}

            <InputGroup>
              <NumberInput
                {...form.getInputProps('maxOrderPerUser')}
                label={t('voucher.max_order_per_user')}
                placeholder={t('voucher.max_order_per_user_placeholder')}
                description="The maximum number of orders a user can apply this voucher to"
                min={1}
              />
              <NumberInput
                {...form.getInputProps('minQtyPerOrder')}
                label={t('voucher.min_qty_per_order')}
                placeholder={t('voucher.min_qty_per_order_placeholder')}
                description="The minimum number of tickets required in an order to use this voucher"
                min={1}
              />
              <NumberInput
                {...form.getInputProps('maxQtyPerOrder')}
                label={t('voucher.max_qty_per_order')}
                placeholder={t('voucher.max_qty_per_order_placeholder')}
                description="The maximum number of tickets that can be discounted in a single order"
                min={1}
              />
            </InputGroup>
          </Stack>
        </Paper>

        <Paper shadow="sm" p="md" className="form-section">
          <Title
            order={4}
            className="section-title"
            leftSection={<IconTarget size={20} />}
          >
            {t('voucher.scope_of_apply')}
          </Title>
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Switch
                {...form.getInputProps('isAllShowings', { type: 'checkbox' })}
                label={t('voucher.apply_to_all_shows')}
                size="md"
                className="switch-container"
              />
              {!form.values.isAllShowings && (
                <Button
                  onClick={() => setModalVisible(true)}
                  className="add-show-button"
                  leftSection={<IconTicket size={16} />}
                >
                  {t('voucher.add_show')}
                </Button>
              )}
            </Group>

            {!form.values.isAllShowings && (
              <>
                <Stack gap="md">
                  {selectedShows.map((show) => (
                    <ShowCard
                      key={show.id}
                      show={show}
                      onRemove={handleShowRemove}
                      onTicketSelectionChange={handleTicketSelectionChange}
                      className="show-card"
                    />
                  ))}
                </Stack>
                <ShowSelectionModal
                  visible={modalVisible}
                  onCancel={() => setModalVisible(false)}
                  onSelect={handleShowSelect}
                  shows={shows || []}
                  selectedShowIds={selectedShows.map((show) => show.id)}
                />
              </>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};
