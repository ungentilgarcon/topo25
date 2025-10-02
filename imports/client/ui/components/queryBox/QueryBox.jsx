import React from 'react'
import PropTypes from 'prop-types'
import ui from 'redux-ui'
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

    const dataSource = this.props.nodes.map( n => (
      {
        value : n.data.id,
        text : n.data.name,
        node :n
      }
    ))

    return (
      <MUIAutocomplete
        options={dataSource}
        getOptionLabel={(o) => o.text || ''}
        sx={{ width: '100%' }}
        onChange={(e, value) => value && this.handleNewRequest(value)}
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
