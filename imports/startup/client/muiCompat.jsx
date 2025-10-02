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
import MUICard from '@mui/material/Card'
import MUICardHeader from '@mui/material/CardHeader'
import MUICardContent from '@mui/material/CardContent'
import MUICardActions from '@mui/material/CardActions'
import MUIDrawer from '@mui/material/Drawer'
import MUIToolbar from '@mui/material/Toolbar'
import MUIDivider from '@mui/material/Divider'
import MUICheckbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import MUIChip from '@mui/material/Chip'
import MUISnackbar from '@mui/material/Snackbar'

export function DialogCompat({ title, actions, modal, open, onRequestClose, style, children }) {
  // Normalize actions to an array and ensure keys to avoid React warnings
  const actionArray = actions == null
    ? []
    : (Array.isArray(actions) ? actions : [actions])
  const keyedActions = React.Children.map(actionArray, (child, idx) => {
    if (!React.isValidElement(child)) return child
    const hasKey = child.key != null
    return hasKey ? child : React.cloneElement(child, { key: `action-${idx}` })
  })
  return (
    <Dialog open={!!open} onClose={onRequestClose} PaperProps={{ sx: style || {} }}>
      {title ? <DialogTitle>{title}</DialogTitle> : null}
      <DialogContent dividers>{children}</DialogContent>
      {keyedActions && keyedActions.length ? <DialogActions>{keyedActions}</DialogActions> : null}
    </Dialog>
  )
}

DialogCompat.propTypes = {
  title: PropTypes.node,
  actions: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
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

export const IconButtonCompat = React.forwardRef(function IconButtonCompat(props, ref) {
  const { style, sx: sxProp, children, ...rest } = props
  const sx = style ? { ...sxProp, ...style } : sxProp
  // Strip legacy MUI 0.x-only props that cause warnings on MUI v5 or DOM
  const {
    onKeyboardFocus, // eslint-disable-line no-unused-vars
    onTouchTap, // eslint-disable-line no-unused-vars
    ...clean
  } = rest
  return (
    <MUIIconButton ref={ref} {...clean} sx={sx}>
      {children}
    </MUIIconButton>
  )
})

IconButtonCompat.propTypes = {
  style: PropTypes.object,
  sx: PropTypes.object,
  children: PropTypes.node
}

// Card compat: map legacy 0.x Card* to MUI v5
export function CardCompat({ children, style, sx: sxProp, ...rest }) {
  const sx = style ? { ...sxProp, ...style } : sxProp
  return <MUICard {...rest} sx={sx}>{children}</MUICard>
}

CardCompat.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
  sx: PropTypes.object
}

export function CardTitleCompat({ title, subtitle, titleStyle, subtitleStyle, ...rest }) {
  return <MUICardHeader title={title} subheader={subtitle} titleTypographyProps={{ sx: titleStyle || {} }} subheaderTypographyProps={{ sx: subtitleStyle || {} }} {...rest} />
}

CardTitleCompat.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  titleStyle: PropTypes.object,
  subtitleStyle: PropTypes.object
}

export function CardTextCompat({ children, style, sx: sxProp, ...rest }) {
  const sx = style ? { ...sxProp, ...style } : sxProp
  return <MUICardContent {...rest} sx={sx}>{children}</MUICardContent>
}

CardTextCompat.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
  sx: PropTypes.object
}

export function CardActionsCompat({ children, style, sx: sxProp, ...rest }) {
  const sx = style ? { ...sxProp, ...style } : sxProp
  return <MUICardActions {...rest} sx={sx}>{children}</MUICardActions>
}

CardActionsCompat.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
  sx: PropTypes.object
}

// Drawer compat
export function DrawerCompat({ style, containerStyle, width, height, openSecondary, variant, sx: sxProp, children, ...rest }) {
  const sx = style ? { ...sxProp, ...style } : sxProp
  const paperSx = containerStyle ? { ...containerStyle } : {}
  if (typeof width !== 'undefined') {
    paperSx.width = width
  }
  // height is not a Drawer paper prop; ignore to avoid DOM warnings
  const anchor = openSecondary ? 'right' : (rest.anchor || 'left')
  // Prefer a non-modal drawer by default so it doesn't trap focus
  const resolvedVariant = variant || 'persistent'
  const cleaned = { ...rest }
  // Ensure we don't forward legacy props
  delete cleaned.anchor
  return (
    <MUIDrawer
      anchor={anchor}
      variant={resolvedVariant}
      hideBackdrop={resolvedVariant !== 'temporary'}
      ModalProps={{
        keepMounted: true,
        // Avoid stealing focus from the main canvas/map
        disableEnforceFocus: true,
        disableAutoFocus: true,
        disableRestoreFocus: true
      }}
      PaperProps={{ sx: paperSx }}
      sx={sx}
      {...cleaned}
    >
      {children}
    </MUIDrawer>
  )
}

DrawerCompat.propTypes = {
  style: PropTypes.object,
  sx: PropTypes.object,
  children: PropTypes.node
}

// Toolbar compat
export function ToolbarCompat({ children, style, sx: sxProp, ...rest }) {
  const sx = style ? { ...sxProp, ...style } : sxProp
  return <MUIToolbar {...rest} sx={sx}>{children}</MUIToolbar>
}

ToolbarCompat.propTypes = {
  children: PropTypes.node,
  style: PropTypes.object,
  sx: PropTypes.object
}

// Divider compat
export function DividerCompat({ style, sx: sxProp, ...rest }) {
  const sx = style ? { ...sxProp, ...style } : sxProp
  return <MUIDivider {...rest} sx={sx} />
}

DividerCompat.propTypes = {
  style: PropTypes.object,
  sx: PropTypes.object
}

// Checkbox compat, supports label prop like legacy
export function CheckboxCompat({ label, labelStyle, iconStyle, style, sx: sxProp, checked, onClick, onChange, disabled, ...rest }) {
  const sxIcon = iconStyle ? { '& .MuiSvgIcon-root': { ...(iconStyle || {}) } } : {}
  const sx = style || sxProp ? { ...sxProp, ...style, ...sxIcon } : (Object.keys(sxIcon).length ? sxIcon : undefined)
  const handleChange = (e, val) => {
    if (onChange) onChange(e, val)
    if (onClick) onClick(e, val)
  }
  if (label != null) {
    return (
      <FormControlLabel
        control={<MUICheckbox checked={!!checked} onChange={handleChange} disabled={disabled} {...rest} />}
        label={label}
        sx={labelStyle ? { '& .MuiFormControlLabel-label': { ...(labelStyle || {}) }, ...(sx || {}) } : sx}
      />
    )
  }
  return <MUICheckbox checked={!!checked} onChange={handleChange} disabled={disabled} sx={sx} {...rest} />
}

CheckboxCompat.propTypes = {
  label: PropTypes.node,
  labelStyle: PropTypes.object,
  iconStyle: PropTypes.object,
  style: PropTypes.object,
  sx: PropTypes.object,
  checked: PropTypes.bool,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  disabled: PropTypes.bool
}

// Chip compat
export function ChipCompat({ children, label, style, sx: sxProp, backgroundColor, onRequestDelete, ...rest }) {
  const baseSx = style ? { ...sxProp, ...style } : sxProp
  const sx = backgroundColor ? { ...baseSx, backgroundColor } : baseSx
  const onDelete = onRequestDelete || rest.onDelete
  return <MUIChip label={label || children} sx={sx} onDelete={onDelete} {...rest} />
}

ChipCompat.propTypes = {
  children: PropTypes.node,
  label: PropTypes.node,
  style: PropTypes.object,
  sx: PropTypes.object
}

// DatePicker compat: simple HTML date input fallback with legacy onChange(e, date)
export class DatePickerCompat extends React.Component {
  focus() { if (this._input && typeof this._input.focus === 'function') this._input.focus() }
  openDialog() { this.focus() }
  render() {
    const { value, onChange, textFieldStyle, style, floatingLabelText, autoOk, ...rest } = this.props
    // value may be a Date or timestamp; convert to yyyy-MM-dd for input
    const toDateStr = (v) => {
      if (!v) return ''
      const d = (v instanceof Date) ? v : new Date(v)
      if (isNaN(d.getTime())) return ''
      const pad = (n) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
    }
    const handle = (e) => {
      const v = e.target.value
      const parts = v && v.split('-')
      const date = (parts && parts.length === 3) ? new Date(parseInt(parts[0]), parseInt(parts[1])-1, parseInt(parts[2])) : null
      if (onChange) onChange(null, date)
    }
    // Map legacy floatingLabelText -> label and remove legacy-only props
    const sx = textFieldStyle || style || {}
    const mapped = { ...rest, label: floatingLabelText }
    return (
      <MUITextField
        type="date"
        value={toDateStr(value)}
        onChange={handle}
        inputRef={el => { this._input = el }}
        sx={sx}
        {...mapped}
      />
    )
  }
}

DatePickerCompat.propTypes = {
  value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func,
  textFieldStyle: PropTypes.object,
  style: PropTypes.object
}

// Snackbar compat: map onRequestClose -> onClose
export function SnackbarCompat({ onRequestClose, ...rest }) {
  const onClose = onRequestClose || rest.onClose
  return <MUISnackbar {...rest} onClose={onClose} />
}

SnackbarCompat.propTypes = {
  onRequestClose: PropTypes.func
}
