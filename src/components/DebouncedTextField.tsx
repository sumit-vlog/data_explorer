import { TextField, type TextFieldProps } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

export const INPUT_DEBOUNCE_MS = 300;

type Props = Omit<TextFieldProps, 'value' | 'onChange'> & {
  value: string;
  onCommit: (value: string) => void;
};

export function DebouncedTextField({ value, onCommit, ...props }: Props) {
  const [draft, setDraft] = useState(value);
  const commit = useDebouncedCallback(onCommit, INPUT_DEBOUNCE_MS);

  useEffect(() => {
    setDraft((current) => (current.trim() === value ? current : value));
  }, [value]);

  return (
    <TextField
      {...props}
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value);
        commit(event.target.value);
      }}
    />
  );
}
