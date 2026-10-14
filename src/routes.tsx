import { Navigate, type RouteObject } from 'react-router-dom';
import { OrderDrawer } from '@/components/OrderDrawer';
import { OrdersPage } from '@/components/OrdersPage';

export const routes: RouteObject[] = [
  {
    path: '/orders',
    element: <OrdersPage />,
    children: [{ path: ':orderId', element: <OrderDrawer /> }],
  },
  { path: '*', element: <Navigate to="/orders" replace /> },
];
