import React from 'react'
import PropTypes from 'prop-types'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MenuItem from '@mui/material/MenuItem'
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
      ...rest
    } = this.props
    return (
      <MUITextField
        {...rest}
        label={floatingLabelText}
        placeholder={hintText}
        error={!!errorText}
        helperText={errorText}
        multiline={!!multiLine}
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
