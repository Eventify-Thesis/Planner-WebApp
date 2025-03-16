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
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconAlertCircle, IconPercentage } from '@tabler/icons-react';
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

interface VoucherFormProps {
  form: UseFormReturnType<VoucherModel>;
}

interface ShowDataType {
  key: string;
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  availableTickets: number;
  tickets: { id: string; name: string }[];
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

  const handleShowRemove = (showId: string) => {
    const newSelectedShows = selectedShows.filter((show) => show.id !== showId);
    setSelectedShows(newSelectedShows);
    updateFormShowings(newSelectedShows);
  };

  const handleTicketSelectionChange = (
    showId: string,
    isAllTickets: boolean,
    selectedTickets: string[],
  ) => {
    const updatedShows = selectedShows.map((show) =>
      show.id === showId
        ? {
            ...show,
            isAllTickets: isAllTickets,
            selectedTicketIds: selectedTickets,
          }
        : show,
    );
    setSelectedShows(updatedShows);
    updateFormShowings(updatedShows);
  };

  const updateFormShowings = (shows: any[]) => {
    const showings = shows.map((show) => ({
      id: show.id,
      isAllTickets: show.isAllTickets ?? true,
      ticketIds: (show.selectedTicketIds ?? show.tickets.map((t: any) => t.id))
        .filter((id: string) => id && typeof id === 'string')
        .map((id: string) => id.toString()),
    }));
    form.setFieldValue('showings', showings);
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
    <Stack gap="xl">
      {/* Ticket Creation Type Selection */}
      <Tabs
        value={ticketCreationType}
        onChange={(value) => setTicketCreationType(value as 'single' | 'bulk')}
      >
        <Tabs.List>
          <Tabs.Tab value="single">{t('voucher.single_ticket')}</Tabs.Tab>
          <Tabs.Tab value="bulk">{t('voucher.bulk_tickets')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="single">
          {/* Basic Information Section */}
          <div>
            <Title order={4} my="md">
              {t('voucher.basic_information')}
            </Title>
            <Stack gap="md">
              <TextInput
                {...form.getInputProps('name')}
                label={t('voucher.name')}
                placeholder={t('voucher.name_placeholder')}
                required
              />
              <TextInput
                {...form.getInputProps('discountCode')}
                label={t('voucher.discount_code')}
                placeholder={t('voucher.discount_code_placeholder')}
                required={ticketCreationType === 'single'}
              />

              <InputGroup>
                <DateTimePicker
                  {...form.getInputProps('startTime')}
                  label={t('voucher.start_time')}
                  placeholder={t('voucher.start_time_placeholder')}
                  valueFormat="DD/MM/YYYY HH:mm"
                />
                <DateTimePicker
                  {...form.getInputProps('endTime')}
                  label={t('voucher.end_time')}
                  placeholder={t('voucher.end_time_placeholder')}
                  valueFormat="DD/MM/YYYY HH:mm"
                />
              </InputGroup>
            </Stack>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="bulk">
          {/* Bulk Ticket Information */}
          <div>
            <Title order={4} my="md">
              {t('voucher.basic_information')}
            </Title>
            <Stack gap="md">
              <TextInput
                {...form.getInputProps('name')}
                label={t('voucher.name')}
                placeholder={t('voucher.name_placeholder')}
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

      {/* Set Up Voucher Section */}
      <div>
        <Title order={4} mb="md">
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
                    value={VoucherDiscountType.PERCENT.toString()}
                    label={t('voucher.discount_type_percent')}
                  />
                  <Radio
                    value={VoucherDiscountType.FIXED.toString()}
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
              min={1}
            />
          )}

          <InputGroup>
            <NumberInput
              {...form.getInputProps('maxOrderPerUser')}
              label={t('voucher.max_order_per_user')}
              placeholder={t('voucher.max_order_per_user_placeholder')}
              min={1}
            />
            <NumberInput
              {...form.getInputProps('minQtyPerOrder')}
              label={t('voucher.min_qty_per_order')}
              placeholder={t('voucher.min_qty_per_order_placeholder')}
              min={1}
            />
            <NumberInput
              {...form.getInputProps('maxQtyPerOrder')}
              label={t('voucher.max_qty_per_order')}
              placeholder={t('voucher.max_qty_per_order_placeholder')}
              min={1}
            />
          </InputGroup>
        </Stack>
      </div>

      {/* Scope of Apply Section */}
      <div>
        <Title order={4} mb="md">
          {t('voucher.scope_of_apply')}
        </Title>
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Switch
              {...form.getInputProps('isAllShowings', { type: 'checkbox' })}
              label={t('voucher.apply_to_all_shows')}
            />
            {!form.values.isAllShowings && (
              <Button onClick={() => setModalVisible(true)}>
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
                  />
                ))}
              </Stack>
              <ShowSelectionModal
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onSelect={handleShowSelect}
                shows={shows?.showings || []}
                selectedShowIds={selectedShows.map((show) => show.id)}
              />
            </>
          )}
        </Stack>
      </div>
    </Stack>
  );
};
