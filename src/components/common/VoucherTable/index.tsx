import { prettyDate, relativeDate } from '@/utils/dates';
import { clipboard } from '@mantine/clipboard';
import {
  Badge,
  Button,
  Flex,
  Group,
  Menu,
  Table as MantineTable,
  Tooltip,
  Switch,
} from '@mantine/core';
import { Table, TableHead } from '@/components/common/Table';
import {
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconPlus,
  IconSend,
  IconTrash,
} from '@tabler/icons-react';
import { Currency } from '../Currency';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import { showSuccess } from '@/utils/notifications';
import { EditVoucherModal } from '../../modals/EditVoucherModal';
import { useState } from 'react';
import { NoResultsSplash } from '../NoResultsSplash';
import { confirmationDialog } from '@/utils/confirmationDialog.tsx';
import { useTranslation } from 'react-i18next';
import { EventModel } from '@/domain/EventModel';
import {
  VoucherDiscountType,
  VoucherModel,
  VoucherStatus,
} from '@/domain/VoucherModel';
import { useUpdateVoucher } from '@/mutations/useUpdateVoucher';
import { useDeleteVoucher } from '@/mutations/useDeleteVoucher';
import { useUpdateVoucherActive } from '@/mutations/useUpdateVoucherActive';

interface VoucherTableProps {
  event: EventModel;
  vouchers: VoucherModel[];
  openCreateModal: () => void;
}

export const VoucherTable = ({
  event,
  vouchers,
  openCreateModal,
}: VoucherTableProps) => {
  const { t } = useTranslation();
  const [voucherId, setVoucherId] = useState<string | undefined>();
  const [editModalOpen, { open: openEditModal, close: closeEditModal }] =
    useDisclosure(false);
  const deleteMutation = useDeleteVoucher();
  const clipboard = useClipboard({ timeout: 500 });
  const updateVoucherMutation = useUpdateVoucherActive();

  const handleEditModal = (voucherId: string | undefined) => {
    setVoucherId(voucherId);
    openEditModal();
  };

  const handleDeleteCode = (voucherId: string) => {
    confirmationDialog(
      t('voucher.delete.confirm'),
      () => {
        deleteMutation.mutate({ eventId: event.id!, voucherId });
      },
      { confirm: t('Delete'), cancel: t('Cancel') },
    );
  };

  const handleStatusChange = (voucherId: string, checked: boolean) => {
    confirmationDialog(
      t('voucher.status.change.confirm'),
      () => {
        updateVoucherMutation.mutate({
          eventId: event.id!,
          voucherId: voucherId!,
          active: checked,
        });
      },
      { confirm: t('Change'), cancel: t('Cancel') },
    );
  };

  if (vouchers.length === 0) {
    return (
      <NoResultsSplash
        heading={t('voucher.no_codes')}
        imageHref={'/blank-slate/promo-codes.svg'}
        subHeading={
          <>
            <p>{t('voucher.description')}</p>
            <Button
              size={'xs'}
              leftSection={<IconPlus />}
              color={'green'}
              onClick={() => openCreateModal()}
            >
              {t('voucher.create')}
            </Button>
          </>
        }
      />
    );
  }

  return (
    <>
      <Table>
        <TableHead>
          <MantineTable.Tr>
            <MantineTable.Th>{t('voucher.code')}</MantineTable.Th>
            <MantineTable.Th>{t('voucher.discount')}</MantineTable.Th>
            <MantineTable.Th>{t('voucher.usage')}</MantineTable.Th>
            <MantineTable.Th>{t('voucher.tickets')}</MantineTable.Th>
            <MantineTable.Th>{t('voucher.apply_expiry_date')}</MantineTable.Th>
            <MantineTable.Th>{t('voucher.status')}</MantineTable.Th>
            <MantineTable.Th></MantineTable.Th>
          </MantineTable.Tr>
        </TableHead>

        <MantineTable.Tbody>
          {vouchers?.map((voucher) => {
            const Discount = () => {
              if (voucher.discountValue === 0) {
                return <>{t('None')}</>;
              }

              if (voucher.discountType === VoucherDiscountType.FIXED) {
                return (
                  <Currency
                    currency={event?.currency ?? 'VND'}
                    price={voucher.discountValue}
                  />
                );
              }

              return <>{voucher.discountValue}%</>;
            };

            const CopyCodeBadge = () => {
              const clipboard = useClipboard({ timeout: 500 });

              return (
                <Badge
                  variant={'outline'}
                  title={t('voucher.copy_code')}
                  style={{ cursor: 'pointer', alignItems: 'center' }}
                  rightSection={
                    <Flex>
                      {clipboard.copied ? (
                        <IconCheck color={'green'} size={'12'} />
                      ) : (
                        <IconCopy size={'12'} />
                      )}
                    </Flex>
                  }
                  onClick={() => {
                    clipboard.copy(voucher.discountCode.toUpperCase());
                    showSuccess(
                      t('voucher.code_copied', {
                        code: voucher.discountCode.toUpperCase(),
                      }),
                    );
                  }}
                >
                  {voucher.discountCode.toUpperCase()}
                </Badge>
              );
            };

            const getExpiryStatus = (expiryDate: Date | string | undefined) => {
              if (!expiryDate) return null;

              const expiry = new Date(expiryDate);
              const now = new Date();
              const oneDay = 24 * 60 * 60 * 1000;

              if (expiry < now) {
                return <Badge color="red">{t('voucher.expired')}</Badge>;
              } else if (expiry.getTime() - now.getTime() <= oneDay) {
                return (
                  <Badge color="orange">{t('voucher.expires_soon')}</Badge>
                );
              } else if (expiry.getTime() - now.getTime() <= 7 * oneDay) {
                return (
                  <Badge color="yellow">{t('voucher.expires_this_week')}</Badge>
                );
              }
              return <Badge color="green">{t('voucher.active')}</Badge>;
            };

            return (
              <MantineTable.Tr key={voucher.id}>
                <MantineTable.Td>
                  <CopyCodeBadge />
                </MantineTable.Td>
                <MantineTable.Td>
                  <Badge color={'cyan'} variant={'light'}>
                    <Discount />
                  </Badge>
                </MantineTable.Td>
                <MantineTable.Td>
                  {voucher.quantity && !voucher.isUnlimited ? (
                    <span>
                      {/* Replace with actual usage count when available */}0 /{' '}
                      {voucher.quantity}
                    </span>
                  ) : (
                    <span title={t('voucher.unlimited')}>∞</span>
                  )}
                </MantineTable.Td>
                <MantineTable.Td>
                  <div style={{ cursor: 'pointer' }}>
                    {voucher.isAllShowings ? (
                      <Badge variant={'light'} color={'pink'}>
                        {t('voucher.all_shows')}
                      </Badge>
                    ) : (
                      <Badge variant={'light'} color={'pink'}>
                        {voucher.showings.length} {t('voucher.shows')}
                      </Badge>
                    )}
                  </div>
                </MantineTable.Td>
                <MantineTable.Td>
                  <Tooltip
                    label={prettyDate(
                      String(voucher.startTime),
                      event.timezone,
                    )}
                  >
                    <Group>
                      {voucher.endTime ? (
                        <>
                          {new Date(voucher.endTime).toLocaleDateString()}
                          {getExpiryStatus(voucher.endTime)}
                        </>
                      ) : (
                        t('voucher.no_expiry')
                      )}
                    </Group>
                  </Tooltip>
                </MantineTable.Td>
                <MantineTable.Td>
                  <Switch
                    checked={voucher.active}
                    onChange={(event) =>
                      handleStatusChange(
                        voucher.id,
                        event.currentTarget.checked,
                      )
                    }
                    color="green"
                  />
                </MantineTable.Td>
                <MantineTable.Td>
                  <Group wrap={'nowrap'} gap={0} justify={'flex-end'}>
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <Button size={'xs'} variant={'transparent'}>
                          <IconDotsVertical />
                        </Button>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Label>{t('common.manage')}</Menu.Label>
                        <Menu.Item
                          leftSection={<IconSend size={14} />}
                          onClick={() => handleEditModal(voucher.id)}
                        >
                          {t('voucher.edit_option')}
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconCopy size={14} />}
                          onClick={() => {
                            clipboard.copy(voucher.discountCode);
                            showSuccess(t('voucher.code_copied'));
                          }}
                        >
                          {t('voucher.copy_code')}
                        </Menu.Item>
                        <Menu.Divider />

                        <Menu.Label>{t('common.danger_zone')}</Menu.Label>
                        <Menu.Item
                          color="red"
                          onClick={() => handleDeleteCode(voucher.id!)}
                          leftSection={<IconTrash size={14} />}
                        >
                          {t('voucher.delete_option')}
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </MantineTable.Td>
              </MantineTable.Tr>
            );
          })}
        </MantineTable.Tbody>
      </Table>

      {voucherId && editModalOpen && (
        <EditVoucherModal voucherId={voucherId} onClose={closeEditModal} />
      )}
    </>
  );
};
