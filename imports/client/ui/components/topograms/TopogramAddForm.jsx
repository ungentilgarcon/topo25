import React from 'react'
import PropTypes from 'prop-types'

import { TextFieldCompat as TextField } from '/imports/startup/client/muiCompat'
import Button from '@mui/material/Button'
import { defineMessages, injectIntl } from '/imports/i18n-shim.js'

import { topogramCreate } from '../../../../api/topograms/topogramsMethods.js'

const formStyle = { padding : '150px' }
const buttonStyle = { marginLeft : 12 }

const messages = defineMessages({
  label :{
    'id': 'topogram.addForm.label',
    'defaultMessage': 'Create a new Topogram',
    'message': ''
  },
  hint : {
    'id': 'topogram.addForm.hint',
    'defaultMessage': 'Input a name',
    'message': ''
  }
})

class TopogramAddForm extends React.Component {
  constructor(props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleSubmit(e) {
    e.preventDefault()

    const topogramTitle = this._topogramTitle && this._topogramTitle.getValue ? this._topogramTitle.getValue() : ''

    if ( topogramTitle != '' ) {
      topogramCreate.call( {
        title : topogramTitle
      }, (err, topogram) => {
        if (err) this.props.promptSnackbar(err)
        else if (topogram.status == 'error') this.props.promptSnackbar( topogram.message )
        else {
          this.props.promptSnackbar('Your new topogram has been created !')
        }
      })
    }
    else {
      this.props.promptSnackbar( 'TopogramName should not be empty' )
    }
  }

  render() {
    const { formatMessage } = this.props.intl
    return (
      <section className="home-create-section">
        <form
          onSubmit={this.handleSubmit}
          style={formStyle}
        >
          <TextField
            name="topogramTitle"
            ref={el => { this._topogramTitle = el }}
            floatingLabelText={formatMessage(messages.label)}
            hintText={formatMessage(messages.hint)}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={buttonStyle}
          >
            Create
          </Button>
        </form>
      </section>
    )
  }
}

TopogramAddForm.propTypes = {
  promptSnackbar: PropTypes.func,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func
  })
}

export default injectIntl(TopogramAddForm)
