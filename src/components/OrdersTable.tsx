import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { OrderQuery, SortField } from '@/lib/searchParams';
import type { Order } from '@/types/order';
import { OrderRow, ROW_HEIGHT } from './OrderRow';

const HEADER_HEIGHT = 57;
const PAGE_STEP = 10;
const SKELETON_ROWS = 10;

const COLUMNS: { label: string; width: number; sortField?: SortField; align?: 'right' }[] = [
  { label: 'Order', width: 130 },
  { label: 'Date', width: 130, sortField: 'createdAt' },
  { label: 'Customer', width: 180, sortField: 'customer' },
  { label: 'Product', width: 200 },
  { label: 'Status', width: 140, sortField: 'status' },
  { label: 'Region', width: 180 },
  { label: 'Total', width: 120, sortField: 'total', align: 'right' },
];

interface Props {
  orders: Order[] | undefined;
  totalCount: number;
  firstRowNumber: number;
  sort: SortField;
  order: OrderQuery['order'];
  fallback: ReactNode;
  onSortChange: (field: SortField) => void;
  onOpen: (id: string) => void;
}

export function OrdersTable({
  orders,
  totalCount,
  firstRowNumber,
  sort,
  order,
  fallback,
  onSortChange,
  onOpen,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldFocusActiveRow = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rowCount = orders?.length ?? 0;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
    scrollPaddingStart: HEADER_HEIGHT,
  });
  const virtualRows = virtualizer.getVirtualItems();
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom = virtualizer.getTotalSize() - (virtualRows.at(-1)?.end ?? 0);
  const activeRowRendered = virtualRows.some((row) => row.index === activeIndex);
  const tabStopIndex = activeRowRendered ? activeIndex : virtualRows[0]?.index;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setActiveIndex(0);
  }, [orders]);

  useEffect(() => {
    if (!shouldFocusActiveRow.current) return;
    const row = scrollRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    if (row) {
      row.focus();
      shouldFocusActiveRow.current = false;
    }
  });

  const moveTo = (index: number) => {
    const next = Math.max(0, Math.min(rowCount - 1, index));
    shouldFocusActiveRow.current = true;
    setActiveIndex(next);
    virtualizer.scrollToIndex(next);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTableSectionElement>) => {
    const rowIndex = (event.target as HTMLElement).dataset.index;
    if (rowIndex === undefined) return;

    const focusedIndex = Number(rowIndex);
    const targets: Record<string, number> = {
      ArrowDown: focusedIndex + 1,
      ArrowUp: focusedIndex - 1,
      PageDown: focusedIndex + PAGE_STEP,
      PageUp: focusedIndex - PAGE_STEP,
      Home: 0,
      End: rowCount - 1,
    };

    if (event.key === 'Enter' && orders?.[focusedIndex]) {
      onOpen(orders[focusedIndex].id);
    } else if (event.key in targets) {
      event.preventDefault();
      moveTo(targets[event.key]!);
    }
  };

  const renderBody = () => {
    if (fallback) {
      return (
        <TableRow>
          <TableCell colSpan={COLUMNS.length}>{fallback}</TableCell>
        </TableRow>
      );
    }

    if (!orders) {
      return Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <TableRow key={index} sx={{ height: ROW_HEIGHT }}>
          {COLUMNS.map((column) => (
            <TableCell key={column.label}>
              <Skeleton />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    return (
      <>
        {paddingTop > 0 && <tr aria-hidden style={{ height: paddingTop }} />}
        {virtualRows.map(({ index }) => (
          <OrderRow
            key={orders[index]!.id}
            order={orders[index]!}
            index={index}
            ariaRowIndex={firstRowNumber + index + 1}
            isTabStop={index === tabStopIndex}
            onOpen={onOpen}
          />
        ))}
        {paddingBottom > 0 && <tr aria-hidden style={{ height: paddingBottom }} />}
      </>
    );
  };

  return (
    <TableContainer
      ref={scrollRef}
      sx={{
        height: { xs: 480, md: 'calc(100vh - 360px)' },
        minHeight: 360,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Table
        stickyHeader
        size="medium"
        aria-label="Orders"
        aria-rowcount={totalCount + 1}
        aria-busy={!orders && !fallback}
        sx={{
          tableLayout: 'fixed',
          minWidth: COLUMNS.reduce((sum, column) => sum + column.width, 0),
        }}
      >
        <TableHead>
          <TableRow aria-rowindex={1}>
            {COLUMNS.map(({ label, width, sortField, align }) => (
              <TableCell
                key={label}
                align={align}
                sx={{ width }}
                sortDirection={sortField === sort ? order : false}
              >
                {sortField ? (
                  <TableSortLabel
                    active={sortField === sort}
                    direction={sortField === sort ? order : 'asc'}
                    onClick={() => onSortChange(sortField)}
                  >
                    {label}
                  </TableSortLabel>
                ) : (
                  label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody
          onKeyDown={handleKeyDown}
          onFocus={(event) => {
            const index = (event.target as HTMLElement).dataset.index;
            if (index !== undefined) setActiveIndex(Number(index));
          }}
          sx={{
            '& tr[data-index] td': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
        >
          {renderBody()}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
