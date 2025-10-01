import React from 'react'
import PropTypes from 'prop-types'
import { ThemeProvider, createTheme, StyledEngineProvider } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: { main: '#4CAF50' },
    secondary: { main: '#3F51B5' },
    error: { main: '#FF5252' },
  },
})

export default function MuiV5Provider({ children }) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  )
}

MuiV5Provider.propTypes = { children: PropTypes.node }
