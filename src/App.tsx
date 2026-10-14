import { CssBaseline, ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from '@/routes';
import { makeStore } from '@/store';
import { theme } from '@/theme';

const store = makeStore();
const router = createBrowserRouter(routes);

export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  );
}
