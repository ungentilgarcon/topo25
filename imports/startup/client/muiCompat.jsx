import React from 'react'
import PropTypes from 'prop-types'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
import ListSubheader from '@mui/material/ListSubheader'
import MUIIconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MUITextField from '@mui/material/TextField'

export function DialogCompat({ title, actions, modal, open, onRequestClose, style, children }) {
  return (
    <Dialog open={!!open} onClose={onRequestClose} PaperProps={{ sx: style || {} }}>
      {title ? <DialogTitle>{title}</DialogTitle> : null}
      <DialogContent dividers>{children}</DialogContent>
      {actions && actions.length ? <DialogActions>{actions}</DialogActions> : null}
    </Dialog>
  )
}

DialogCompat.propTypes = {
  title: PropTypes.node,
  actions: PropTypes.array,
  modal: PropTypes.bool,
  open: PropTypes.bool,
  onRequestClose: PropTypes.func,
  style: PropTypes.object,
  children: PropTypes.node
}

export function MenuItemCompat({ primaryText, leftIcon, style, children, ...rest }) {
  return (
    <MenuItem {...rest} sx={style || {}}>
      {leftIcon ? <ListItemIcon>{leftIcon}</ListItemIcon> : null}
      {primaryText ? <ListItemText primary={primaryText} /> : (children || null)}
    </MenuItem>
  )
}

MenuItemCompat.propTypes = {
  primaryText: PropTypes.node,
  leftIcon: PropTypes.node,
  style: PropTypes.object,
  children: PropTypes.node
}

export class TextFieldCompat extends React.Component {
  getValue() {
    return this._input && this._input.value != null ? this._input.value : ''
  }
  render() {
    const {
      floatingLabelText,
      hintText,
      errorText,
      multiLine,
      floatingLabelFixed, // eslint-disable-line no-unused-vars
      floatingLabelStyle, // legacy MUI 0.x label style
      underlineStyle, // legacy MUI 0.x underline style (ignored by default)
      sx: sxProp,
      ...rest
    } = this.props
    // Do not leak legacy style props onto DOM; map what we can to MUI v5
    const InputLabelProps = floatingLabelStyle ? { sx: floatingLabelStyle } : undefined
    // Optionally map underline style to standard variant underline selectors if provided
    // Keep variant unchanged; only apply underline styles if consumer sets variant='standard'
    const sx = underlineStyle ? {
      ...sxProp,
      '& .MuiInput-underline:before': { ...(underlineStyle || {}) },
      '& .MuiInput-underline:after': { ...(underlineStyle || {}) }
    } : sxProp
    return (
      <MUITextField
        {...rest}
        label={floatingLabelText}
        placeholder={hintText}
        error={!!errorText}
        helperText={errorText}
        multiline={!!multiLine}
        InputLabelProps={InputLabelProps}
        sx={sx}
        inputRef={el => { this._input = el }}
      />
    )
  }
}

TextFieldCompat.propTypes = {
  floatingLabelText: PropTypes.node,
  hintText: PropTypes.node,
  errorText: PropTypes.node,
  multiLine: PropTypes.bool
}

export function SubheaderCompat({ children, style }) {
  return <ListSubheader sx={style || {}}>{children}</ListSubheader>
}

SubheaderCompat.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object
}

export function IconButtonCompat({ style, sx: sxProp, children, ...rest }) {
  const sx = style ? { ...sxProp, ...style } : sxProp
  return (
    <MUIIconButton {...rest} sx={sx}>
      {children}
    </MUIIconButton>
  )
}

IconButtonCompat.propTypes = {
  style: PropTypes.object,
  sx: PropTypes.object,
  children: PropTypes.node
}
