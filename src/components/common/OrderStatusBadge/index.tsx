import { Badge, BadgeVariant } from '@mantine/core';
import { getStatusColor } from '../../../utils/helpers.ts';
import { OrderModel, OrderStatus } from '@/domain/OrderModel.ts';

export const OrderStatusBadge = ({
  order,
  variant = 'outline',
}: {
  order: OrderModel;
  variant?: BadgeVariant;
}) => {
  let color;
  let title;
  if (
    order.status !== OrderStatus.PAYMENT_FAILED &&
    order.status !== OrderStatus.CANCELLED
  ) {
    color = getStatusColor(order.status);
    title = order.status;
  } else {
    color = getStatusColor(order.status);
    title = order.status;
  }

  return (
    <Badge color={color} variant={variant}>
      {title.replace('_', ' ')}
    </Badge>
  );
};
