import { configureStore } from '@reduxjs/toolkit';
import { ordersApi } from '@/api/ordersApi';

export function makeStore() {
  return configureStore({
    reducer: { [ordersApi.reducerPath]: ordersApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(ordersApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
