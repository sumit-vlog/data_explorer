import { Alert, AlertTitle, Button, Stack, Typography } from '@mui/material';

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={onRetry}>
          Retry
        </Button>
      }
    >
      <AlertTitle>Orders couldn&apos;t be loaded</AlertTitle>
      {message}
    </Alert>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Stack spacing={1} alignItems="center" sx={{ py: 6, textAlign: 'center' }}>
      <Typography variant="h6" component="p">
        {title}
      </Typography>
      <Typography color="text.secondary">{description}</Typography>
      <Button variant="outlined" onClick={onAction}>
        {actionLabel}
      </Button>
    </Stack>
  );
}
