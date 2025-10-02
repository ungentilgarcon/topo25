import React from 'react'
import PropTypes from 'prop-types'

export default function MuiV5Provider({ children }) {
  // Lazy-load MUI v5 provider so the app doesn't crash if @mui/material is missing
  // (e.g., on environments that haven’t installed the prep deps yet).
  let ThemeProvider, createTheme, StyledEngineProvider
  try {
    const styles = require('@mui/material/styles')
    ThemeProvider = styles.ThemeProvider
    createTheme = styles.createTheme
    StyledEngineProvider = styles.StyledEngineProvider
  } catch (e) {
    // No MUI v5 available yet; render children as-is (no-op provider)
    return children || null
  }

  const theme = createTheme({
    palette: {
      primary: { main: '#4CAF50' },
      secondary: { main: '#3F51B5' },
      error: { main: '#FF5252' },
    },
  })

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </StyledEngineProvider>
  )
}

MuiV5Provider.propTypes = { children: PropTypes.node }
