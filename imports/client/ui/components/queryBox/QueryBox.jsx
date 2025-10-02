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

    // Map incoming nodes to options and dedupe by unique id to avoid duplicate keys
    const seen = new Set()
    const dataSource = []
    for (const n of this.props.nodes) {
      const id = n?.data?.id
      if (id == null || seen.has(id)) continue
      seen.add(id)
      dataSource.push({
        value: id,
        text: n?.data?.name || String(id),
        node: n,
      })
    }

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
            floatingLabelText={formatMessage(messages.label)}
            hintText={formatMessage(messages.hint)}
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
  })
}

QueryBox.defaultProps = {
  topogram : {},
  nodes : [],
  edges : []
}

export default injectIntl(QueryBox)
