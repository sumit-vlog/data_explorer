import { Alert, Button, Paper, Skeleton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useGetSummaryQuery } from '@/api/ordersApi';
import { formatCount, formatCurrency } from '@/lib/format';
import type { OrderFilters } from '@/lib/searchParams';
import { ORDER_STATUSES } from '@/types/order';
import { StatusChip } from './StatusChip';

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" component="p">
        {value ?? <Skeleton width={96} />}
      </Typography>
    </Stack>
  );
}

export function SummaryBar({
  filters,
  matchCount,
}: {
  filters: OrderFilters;
  matchCount?: number;
}) {
  const { currentData: summary, isError, isFetching, refetch } = useGetSummaryQuery(filters);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={4}
        alignItems={{ sm: 'center' }}
        useFlexGap
        flexWrap="wrap"
      >
        <Stat
          label="Matching orders"
          value={matchCount === undefined ? undefined : formatCount(matchCount)}
        />
        {isError && !isFetching ? (
          <Alert
            severity="warning"
            sx={{ flex: 1 }}
            action={
              <Button color="inherit" size="small" onClick={refetch}>
                Retry
              </Button>
            }
          >
            Revenue and status totals couldn&apos;t be loaded. The order list is unaffected.
          </Alert>
        ) : (
          <>
            <Stat label="Revenue" value={summary && formatCurrency(summary.totalRevenue)} />
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              flexWrap="wrap"
              aria-label="Orders by status"
            >
              {summary ? (
                ORDER_STATUSES.map((status) => (
                  <StatusChip
                    key={status}
                    status={status}
                    count={formatCount(summary.countByStatus[status])}
                  />
                ))
              ) : (
                <Skeleton width={360} height={32} />
              )}
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}
