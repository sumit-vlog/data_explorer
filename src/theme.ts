import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  cssVariables: true,
  colorSchemes: { light: true, dark: true },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        'html *:focus-visible': {
          outline: `2px solid ${theme.vars.palette.primary.main}`,
          outlineOffset: 2,
        },
      }),
    },
  },
});
