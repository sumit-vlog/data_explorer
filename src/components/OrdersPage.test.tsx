import { screen, waitFor, within } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { generateOrders } from '@/mocks/data';
import { server } from '@/mocks/server';
import { renderApp } from '@/test/renderApp';

const [sampleOrder] = generateOrders(1);

const ordersResponse = (customer: string) =>
  HttpResponse.json({ items: [{ ...sampleOrder, customer }], total: 1 });

const failOnce = (path: string) =>
  server.use(
    http.get(
      `*/api/${path}`,
      () => HttpResponse.json({ message: 'Server exploded' }, { status: 500 }),
      {
        once: true,
      },
    ),
  );

describe('OrdersPage', () => {
  it('never lets a slow, superseded response overwrite a newer one', async () => {
    server.use(
      http.get('*/api/orders', async ({ request }) => {
        const q = new URL(request.url).searchParams.get('q');
        await delay(q === 'first' ? 1_000 : 20);
        return ordersResponse(`${q} result`);
      }),
    );
    const { user } = renderApp('/orders?q=first');

    const search = screen.getByRole('searchbox', { name: 'Search' });
    await user.clear(search);
    await user.type(search, 'second');

    expect(await screen.findByText('second result')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 1_200));
    expect(screen.queryByText('first result')).not.toBeInTheDocument();
    expect(screen.getByText('second result')).toBeInTheDocument();
  });

  it('replaces old rows with an error and recovers on retry', async () => {
    const { user, router } = renderApp('/orders');
    await screen.findAllByText(/ORD-\d+/);

    failOnce('orders');
    await user.click(screen.getByRole('button', { name: 'Total' }));

    expect(await screen.findByText('Server exploded')).toBeInTheDocument();
    expect(screen.queryByText(/ORD-\d+/)).not.toBeInTheDocument();
    expect(router.state.location.search).toBe('?sort=total&order=asc');

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect((await screen.findAllByText(/ORD-\d+/)).length).toBeGreaterThan(0);
  });

  it('shows a partial failure when only the summary request fails', async () => {
    failOnce('orders/summary');
    const { user } = renderApp('/orders');

    expect(await screen.findByText(/totals couldn.t be loaded/)).toBeInTheDocument();
    expect((await screen.findAllByText(/ORD-\d+/)).length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Revenue')).toBeInTheDocument();
  });

  it('restores the full view from the URL', async () => {
    renderApp('/orders?q=kim&status=shipped&page=2');

    expect(screen.getByRole('searchbox', { name: 'Search' })).toHaveValue('kim');
    expect(screen.getByRole('combobox', { name: 'Status' })).toHaveTextContent('shipped');
    expect(
      await screen.findByRole('button', { name: 'page 2', current: 'page' }),
    ).toBeInTheDocument();
  });

  it('opens a deep-linked order and closes back to the same list view', async () => {
    const { user, router } = renderApp(`/orders/${sampleOrder!.id}?q=smith`);

    const dialog = await screen.findByRole('dialog', { name: `Order ${sampleOrder!.id}` });
    expect(await within(dialog).findByText(sampleOrder!.email)).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Close order details' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/orders'));
    expect(router.state.location.search).toBe('?q=smith');
  });
});
