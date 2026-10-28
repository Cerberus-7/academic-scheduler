import { createTheme } from '@mui/material/styles'

export const getAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#232931' : '#E8E5DF',
        light: mode === 'light' ? '#39414D' : '#F5F3EF',
        dark: mode === 'light' ? '#14181D' : '#D1CDBF',
        contrastText: mode === 'light' ? '#FBF9F5' : '#191716',
      },
      secondary: {
        main: '#A35C38', // Warm Terracotta
        light: '#BE7854',
        dark: '#7D4123',
        contrastText: '#FFFFFF',
      },
      background:
        mode === 'light'
          ? {
              default: '#F7F5F0', // Warm ambient linen
              paper: '#FFFFFF',
            }
          : {
              default: '#161413', // Warm charcoal-amber dark mode
              paper: '#1F1C1A',
            },
      text:
        mode === 'light'
          ? {
              primary: '#24201D',
              secondary: '#69625A',
            }
          : {
              primary: '#F0ECE4',
              secondary: '#A19A91',
            },
      divider: mode === 'light' ? '#E8E4DC' : '#2D2825',
      success: {
        main: '#486B52', // Soft forest sage
        light: '#658D70',
        dark: '#304B38',
      },
      warning: {
        main: '#A87028', // Muted warm amber / ochre
        light: '#C98C3F',
        dark: '#7A4F16',
      },
      error: {
        main: '#A64239', // Warm rustic brick red
        light: '#C75C53',
        dark: '#782C24',
      },
      info: {
        main: '#416378', // Warm slate blue
        light: '#5E8299',
        dark: '#2A4453',
      },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: ['"Inter"', '"Newsreader"', '"Georgia"', 'serif'].join(','),
      h4: {
        fontWeight: 650,
        letterSpacing: '-0.02em',
        fontFamily: ['"Newsreader"', '"Georgia"', 'serif'].join(','),
      },
      h5: {
        fontWeight: 650,
        letterSpacing: '-0.01em',
        fontFamily: ['"Newsreader"', '"Georgia"', 'serif'].join(','),
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '-0.01em',
      },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.55 },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderColor: mode === 'light' ? '#E8E4DC' : '#2D2825',
            backgroundColor: mode === 'light' ? '#FDFCFA' : '#1A1817',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            borderColor: mode === 'light' ? '#E8E4DC' : '#2D2825',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          outlined: {
            borderColor: mode === 'light' ? '#E8E4DC' : '#2D2825',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 6,
          },
          containedSecondary: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 6,
          },
        },
      },
    },
  })

export const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  approved: 'success',
  active: 'success',
  available: 'success',
  applied: 'success',
  pending: 'warning',
  under_discussion: 'warning',
  alternative_proposed: 'warning',
  occupied: 'warning',
  rejected: 'error',
  failed: 'error',
  conflict: 'error',
  maintenance: 'error',
  unavailable: 'error',
  scheduled: 'info',
  information: 'info',
  cancelled: 'default',
  expired: 'default',
  moved: 'default',
}
