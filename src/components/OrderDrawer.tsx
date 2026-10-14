import CloseIcon from '@mui/icons-material/Close';
import { Alert, Button, Drawer, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useGetOrderQuery } from '@/api/ordersApi';
import { getErrorMessage, isNotFound } from '@/lib/errors';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Order } from '@/types/order';
import { StatusChip } from './StatusChip';

const TITLE_ID = 'order-drawer-title';

function OrderDetails({ order }: { order: Order }) {
  const fields: [string, ReactNode][] = [
    ['Status', <StatusChip key="status" status={order.status} />],
    ['Placed on', formatDate(order.createdAt)],
    ['Customer', order.customer],
    ['Email', order.email],
    ['Product', order.product],
    ['Category', order.category],
    ['Quantity', order.quantity],
    ['Region', order.region],
    ['Total', formatCurrency(order.total)],
  ];

  return (
    <Stack component="dl" spacing={2} sx={{ m: 0 }}>
      {fields.map(([label, value]) => (
        <div key={label}>
          <Typography component="dt" variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography component="dd" sx={{ m: 0 }}>
            {value}
          </Typography>
        </div>
      ))}
    </Stack>
  );
}

export function OrderDrawer() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const { currentData: order, isError, isFetching, error, refetch } = useGetOrderQuery(orderId);
  const openedFromList = (location.state as { fromList?: boolean } | null)?.fromList;

  const returnToList = () => {
    if (openedFromList) navigate(-1);
    else navigate({ pathname: '/orders', search: location.search }, { replace: true });
  };

  const renderContent = () => {
    if (isError && !isFetching) {
      return isNotFound(error) ? (
        <Alert severity="info">No order exists with ID {orderId}.</Alert>
      ) : (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={refetch}>
              Retry
            </Button>
          }
        >
          {getErrorMessage(error)}
        </Alert>
      );
    }
    if (!order) {
      return (
        <Stack spacing={2} aria-busy>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height={40} />
          ))}
        </Stack>
      );
    }
    return <OrderDetails order={order} />;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      SlideProps={{ onExited: returnToList }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': TITLE_ID,
        sx: { width: { xs: '100%', sm: 440 }, p: 3 },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography id={TITLE_ID} variant="h5" component="h2">
          Order {orderId}
        </Typography>
        <IconButton aria-label="Close order details" onClick={() => setOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Stack>
      {renderContent()}
    </Drawer>
  );
}
