import React from 'react'
import PropTypes from 'prop-types'
import ui from '/imports/client/legacyUi'
import { defineMessages, injectIntl } from 'react-intl'
import MUIAutocomplete from '@mui/material/Autocomplete'
import { TextFieldCompat as TextField } from '/imports/startup/client/muiCompat'

const messages = defineMessages({
  hint : {
    'id': 'queryBox.hint',
    'defaultMessage': 'Search for a venue',
    'message': ''
  },
  label : {
    'id': 'queryBox.label',
    'defaultMessage': 'Venue searcher',
    'message': ''
  }
})

@ui()
class QueryBox extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      currentValue : null
    }
  }

  handleNewRequest = ({value, text, node}, index) => {
    const {selectElement} = this.props
    console.log(node)
    selectElement(node)
  }

  render() {
    const { formatMessage } = this.props.intl
    const {
      labelMessageId,
      hintMessageId,
      labelDefault,
      hintDefault,
      sx: sxProp
    } = this.props

    // Map incoming nodes to options and dedupe by unique id to avoid duplicate keys
    const seen = new Set()
    const dataSource = []
    for (const n of (this.props.nodes || [])) {
      const id = n?.data?.id
      if (id == null || seen.has(id)) continue
      seen.add(id)
      dataSource.push({
        value: id,
        text: n?.data?.name || String(id),
        node: n,
      })
    }

    // Resolve label/hint via i18n with optional override IDs
    const labelText = labelMessageId
      ? formatMessage({ id: labelMessageId, defaultMessage: labelDefault || 'Venue search' })
      : formatMessage(messages.label)
    const hintText = hintMessageId
      ? formatMessage({ id: hintMessageId, defaultMessage: hintDefault || 'Search for a venue' })
      : formatMessage(messages.hint)

    // Default ivory-on-dark styling if sx provided by parent; otherwise leave theme defaults
    const sx = sxProp || undefined

    return (
      <MUIAutocomplete
        options={dataSource}
        getOptionLabel={(o) => o.text || ''}
  isOptionEqualToValue={(opt, val) => (opt?.value ?? null) === (val?.value ?? null)}
        sx={{ width: '100%' }}
        onChange={(e, value) => value && this.handleNewRequest(value)}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {option.text}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            floatingLabelText={labelText}
            hintText={hintText}
            sx={sx}
          />
        )}
      />
    )
  }
}

QueryBox.propTypes = {
  // promptSnackbar: PropTypes.func,
  // topogram : PropTypes.object,
  nodes : PropTypes.array,
  // edges : PropTypes.array,
  // style : PropTypes.object,
  intl : PropTypes.shape({
    formatMessage : PropTypes.func
  }),
  labelMessageId: PropTypes.string,
  hintMessageId: PropTypes.string,
  labelDefault: PropTypes.string,
  hintDefault: PropTypes.string,
  sx: PropTypes.object
}

// default props removed; use safe fallbacks in render instead to avoid memo/defaultProps warning

export default injectIntl(QueryBox)
