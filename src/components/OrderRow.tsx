import { TableCell, TableRow } from '@mui/material';
import { memo } from 'react';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Order } from '@/types/order';
import { StatusChip } from './StatusChip';

export const ROW_HEIGHT = 53;

interface Props {
  order: Order;
  index: number;
  ariaRowIndex: number;
  isTabStop: boolean;
  onOpen: (id: string) => void;
}

export const OrderRow = memo(function OrderRow({
  order,
  index,
  ariaRowIndex,
  isTabStop,
  onOpen,
}: Props) {
  return (
    <TableRow
      hover
      data-index={index}
      aria-rowindex={ariaRowIndex}
      tabIndex={isTabStop ? 0 : -1}
      onClick={() => onOpen(order.id)}
      sx={{ height: ROW_HEIGHT, cursor: 'pointer' }}
    >
      <TableCell sx={{ fontFamily: 'monospace' }}>{order.id}</TableCell>
      <TableCell>{formatDate(order.createdAt)}</TableCell>
      <TableCell>{order.customer}</TableCell>
      <TableCell>{order.product}</TableCell>
      <TableCell>
        <StatusChip status={order.status} />
      </TableCell>
      <TableCell>{order.region}</TableCell>
      <TableCell align="right">{formatCurrency(order.total)}</TableCell>
    </TableRow>
  );
});
