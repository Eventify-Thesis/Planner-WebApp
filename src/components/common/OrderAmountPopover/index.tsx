import { useDisclosure } from '@mantine/hooks';
import { Badge, Flex, MantineColor, Popover } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import classes from './OrderAmountPopover.module.scss';
import { formatStatus } from '../../../utils/helpers.ts';
import { OrderSummary } from '../OrderSummary/index.tsx';
import { OrderModel, OrderStatus } from '@/domain/OrderModel.ts';
import { formatCurrency } from '@/utils/currency.ts';

interface OrderAmountPopoverProps {
  order: OrderModel;
}

export const OrderAmountPopover = ({ order }: OrderAmountPopoverProps) => {
  const [isPopoverOpen, popover] = useDisclosure(false);

  const badgeColor = (): MantineColor => {
    switch (order.status) {
      case OrderStatus.PENDING:
      case OrderStatus.CANCELLED:
      case OrderStatus.PAYMENT_FAILED:
        return 'orange';
      default:
        return 'green';
    }
  };

  return (
    <Popover
      width={350}
      position="bottom"
      withArrow
      shadow="md"
      opened={isPopoverOpen}
    >
      <Popover.Target>
        <Badge
          variant={'light'}
          style={{ cursor: 'help', border: '1px solid' }}
          rightSection={
            <Flex align={'center'}>
              <IconInfoCircle size={14} />
            </Flex>
          }
          color={badgeColor()}
          onMouseEnter={popover.open}
          onMouseLeave={popover.close}
        >
          {formatCurrency(order.totalAmount, 'VND')}
        </Badge>
      </Popover.Target>
      <Popover.Dropdown style={{ pointerEvents: 'none' }}>
        <div className={classes.paymentStatus}>
          {formatStatus(String(order.status))}
        </div>
        <OrderSummary order={order} showFreeWhenZeroTotal={false} />
      </Popover.Dropdown>
    </Popover>
  );
};
