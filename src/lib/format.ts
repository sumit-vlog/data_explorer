const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
const countFormat = new Intl.NumberFormat('en-US');

export const formatCurrency = (value: number) => currencyFormat.format(value);
export const formatDate = (iso: string) => dateFormat.format(new Date(iso));
export const formatCount = (value: number) => countFormat.format(value);
