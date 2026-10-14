import { CssBaseline, ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routes } from '@/routes';
import { makeStore } from '@/store';
import { theme } from '@/theme';

export function renderApp(initialPath = '/orders') {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  const user = userEvent.setup();

  render(
    <Provider store={makeStore()}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>,
  );

  return { router, user };
}
