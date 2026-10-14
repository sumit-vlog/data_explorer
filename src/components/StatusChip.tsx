import { Chip, type ChipProps } from '@mui/material';
import type { OrderStatus } from '@/types/order';

const STATUS_COLOR: Record<OrderStatus, ChipProps['color']> = {
  pending: 'default',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
  refunded: 'warning',
};

export function StatusChip({ status, count }: { status: OrderStatus; count?: string }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      color={STATUS_COLOR[status]}
      label={count === undefined ? status : `${status}: ${count}`}
      sx={{ textTransform: 'capitalize' }}
    />
  );
}
