import SearchIcon from '@mui/icons-material/Search';
import { Button, InputAdornment, MenuItem, Stack, TextField } from '@mui/material';
import type { OrderQuery } from '@/lib/searchParams';
import { ORDER_STATUSES, REGIONS } from '@/types/order';
import { DebouncedTextField } from './DebouncedTextField';

interface Props {
  query: OrderQuery;
  canReset: boolean;
  onChange: (patch: Partial<OrderQuery>) => void;
  onReset: () => void;
}

const toAmount = (value: string) => (value.trim() === '' ? undefined : Number(value));

export function FiltersBar({ query, canReset, onChange, onReset }: Props) {
  return (
    <Stack
      role="search"
      aria-label="Filter orders"
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      useFlexGap
    >
      <DebouncedTextField
        label="Search"
        placeholder="Order ID, customer, email or product"
        type="search"
        size="small"
        value={query.q}
        onCommit={(q) => onChange({ q })}
        sx={{ flex: 2, minWidth: 240 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        select
        label="Status"
        size="small"
        value={query.status ?? ''}
        onChange={(event) =>
          onChange({ status: (event.target.value || undefined) as OrderQuery['status'] })
        }
        sx={{ flex: 1, minWidth: 150, textTransform: 'capitalize' }}
      >
        <MenuItem value="">All statuses</MenuItem>
        {ORDER_STATUSES.map((status) => (
          <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
            {status}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Region"
        size="small"
        value={query.region ?? ''}
        onChange={(event) =>
          onChange({ region: (event.target.value || undefined) as OrderQuery['region'] })
        }
        sx={{ flex: 1, minWidth: 170 }}
      >
        <MenuItem value="">All regions</MenuItem>
        {REGIONS.map((region) => (
          <MenuItem key={region} value={region}>
            {region}
          </MenuItem>
        ))}
      </TextField>
      <DebouncedTextField
        label="Min total ($)"
        type="number"
        size="small"
        value={query.minTotal?.toString() ?? ''}
        onCommit={(value) => onChange({ minTotal: toAmount(value) })}
        slotProps={{ htmlInput: { min: 0 } }}
        sx={{ flex: 1, minWidth: 120 }}
      />
      <DebouncedTextField
        label="Max total ($)"
        type="number"
        size="small"
        value={query.maxTotal?.toString() ?? ''}
        onCommit={(value) => onChange({ maxTotal: toAmount(value) })}
        slotProps={{ htmlInput: { min: 0 } }}
        sx={{ flex: 1, minWidth: 120 }}
      />
      <Button variant="outlined" onClick={onReset} disabled={!canReset} sx={{ flexShrink: 0 }}>
        Reset filters
      </Button>
    </Stack>
  );
}
