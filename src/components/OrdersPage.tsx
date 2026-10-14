import { Box, Container, Link, Stack, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { useCallback, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useOrderParams } from '@/hooks/useOrderParams';
import { useOrders } from '@/hooks/useOrders';
import { getErrorMessage } from '@/lib/errors';
import { formatCount } from '@/lib/format';
import { DEFAULT_QUERY, pickFilters, serializeQuery, type SortField } from '@/lib/searchParams';
import { FiltersBar } from './FiltersBar';
import { OrdersTable } from './OrdersTable';
import { PaginationBar } from './PaginationBar';
import { EmptyState, ErrorState } from './ResultState';
import { SummaryBar } from './SummaryBar';

export function OrdersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { query, updateQuery, resetQuery } = useOrderParams();
  const { currentData, isError, isFetching, error, retry } = useOrders(query);
  const filters = useMemo(() => pickFilters(query), [query]);
  const hasFilters = serializeQuery(filters).size > 0;
  const showError = isError && !isFetching;

  const openOrder = useCallback(
    (id: string) =>
      navigate(
        { pathname: `/orders/${encodeURIComponent(id)}`, search: location.search },
        { state: { fromList: true } },
      ),
    [navigate, location.search],
  );

  const changeSort = (field: SortField) => {
    const order = field === query.sort && query.order === 'asc' ? 'desc' : 'asc';
    updateQuery({ sort: field, order });
  };

  const renderFallback = () => {
    if (showError) return <ErrorState message={getErrorMessage(error)} onRetry={retry} />;
    if (!currentData || currentData.items.length > 0) return null;
    if (currentData.total === 0) {
      return (
        <EmptyState
          title="No orders match your filters"
          description="Try a different search term or remove some filters."
          actionLabel="Reset filters"
          onAction={resetQuery}
        />
      );
    }
    return (
      <EmptyState
        title="This page is empty"
        description={`There are only ${formatCount(currentData.total)} matching orders.`}
        actionLabel="Go to first page"
        onAction={() => updateQuery({ page: DEFAULT_QUERY.page })}
      />
    );
  };

  const announcement = showError
    ? ''
    : !currentData
      ? 'Loading orders…'
      : `${formatCount(currentData.total)} orders found.`;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Link
        href="#results"
        sx={{
          position: 'absolute',
          left: -9999,
          '&:focus': { left: 16, top: 8, zIndex: 'tooltip' },
        }}
      >
        Skip to results
      </Link>
      <Stack spacing={2}>
        <Typography variant="h4" component="h1">
          Order explorer
        </Typography>
        <FiltersBar
          query={query}
          canReset={hasFilters}
          onChange={updateQuery}
          onReset={resetQuery}
        />
        <SummaryBar filters={filters} matchCount={currentData?.total} />
        <Box component="section" id="results" aria-label="Order results" tabIndex={-1}>
          <OrdersTable
            orders={showError ? [] : currentData?.items}
            totalCount={currentData?.total ?? 0}
            firstRowNumber={(query.page - 1) * query.pageSize + 1}
            sort={query.sort}
            order={query.order}
            fallback={renderFallback()}
            onSortChange={changeSort}
            onOpen={openOrder}
          />
        </Box>
        {currentData && currentData.total > 0 && (
          <PaginationBar
            page={query.page}
            pageSize={query.pageSize}
            total={currentData.total}
            onChange={updateQuery}
          />
        )}
      </Stack>
      <Box role="status" sx={visuallyHidden}>
        {announcement}
      </Box>
      <Outlet />
    </Container>
  );
}
