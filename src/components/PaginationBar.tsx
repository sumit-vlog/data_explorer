import { MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import { formatCount } from '@/lib/format';
import { PAGE_SIZES, type OrderQuery } from '@/lib/searchParams';

interface Props {
  page: number;
  pageSize: number;
  total: number;
  onChange: (patch: Partial<OrderQuery>) => void;
}

export function PaginationBar({ page, pageSize, total, onChange }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const firstRow = Math.min((page - 1) * pageSize + 1, total);
  const lastRow = Math.min(page * pageSize, total);

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
    >
      <Typography variant="body2" color="text.secondary">
        Showing {formatCount(firstRow)}–{formatCount(lastRow)} of {formatCount(total)}
      </Typography>
      <Pagination
        page={Math.min(page, pageCount)}
        count={pageCount}
        onChange={(_, nextPage) => onChange({ page: nextPage })}
        showFirstButton
        showLastButton
        siblingCount={1}
      />
      <TextField
        select
        size="small"
        label="Rows per page"
        value={pageSize}
        onChange={(event) => onChange({ pageSize: Number(event.target.value) })}
        sx={{ minWidth: 130 }}
      >
        {PAGE_SIZES.map((size) => (
          <MenuItem key={size} value={size}>
            {size}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
