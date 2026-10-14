import { DEFAULT_QUERY, parseQuery, serializeQuery } from './searchParams';

describe('search params', () => {
  it('round-trips a full query through the URL', () => {
    const query = {
      ...DEFAULT_QUERY,
      q: 'kim',
      status: 'shipped',
      minTotal: 50,
      sort: 'total',
      order: 'asc',
      page: 3,
      pageSize: 100,
    } as const;

    expect(parseQuery(serializeQuery(query))).toEqual(query);
  });

  it('falls back to defaults for invalid values instead of throwing', () => {
    const query = parseQuery(
      new URLSearchParams('status=lost&page=-4&pageSize=7&sort=evil&minTotal=abc'),
    );

    expect(query).toEqual(DEFAULT_QUERY);
  });

  it('omits default values to keep URLs short', () => {
    expect(serializeQuery({ ...DEFAULT_QUERY, q: 'mia' }).toString()).toBe('q=mia');
  });
});
