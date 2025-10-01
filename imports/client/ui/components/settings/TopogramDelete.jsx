import React from 'react'
import PropTypes from 'prop-types'

import MenuItem from 'material-ui/MenuItem'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import Delete from 'material-ui/svg-icons/action/delete'
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl'
import { red500 } from 'material-ui/styles/colors'

import { topogramDelete } from '../../../../api/topograms/topogramsMethods.js'

const messages = defineMessages({
  confirmQuestion : {
    'id': 'topogram.index.card.deleteDialog.confirmQuestion',
    'defaultMessage': 'Are you sure you want to delete this topogram ?',
    'message': ''
  },
  cancel : {
    'id': 'topogram.deleteDialog.button.cancel',
    'defaultMessage': 'Cancel',
    'message': ''
  },
  delete : {
    'id': 'topogram.deleteDialog.button.delete',
    'defaultMessage': 'Delete',
    'message': ''
  }
})

class TopogramDelete extends React.Component {
  static propTypes = {
    topogramTitle: PropTypes.string,
    topogramId: PropTypes.string.isRequired,
    router: PropTypes.object.isRequired,
    intl: PropTypes.object.isRequired,
  }

  static defaultProps = {
    topogramTitle: '',
    topogramId: ''
  }

  state = { open: false }

  handleOpen = () => { this.setState({ open: true }) }
  handleClose = () => { this.setState({ open: false }) }
  _deleteItem = () => {
    topogramDelete.call({ topogramId : this.props.topogramId })
    this.props.router.push('/')
  }

  render() {
    const { formatMessage } = this.props.intl
    const actions = [
      <FlatButton
        key="cancel"
        label={formatMessage(messages.cancel)}
        primary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        key="delete"
        style={{backgroundColor: 'rgba(69,90,100 ,0.9)', color:'#F2EFE9',}}
        label={formatMessage(messages.delete)}
        primary={true}
        keyboardFocused={true}
        onTouchTap={this._deleteItem}
      />,
    ]
    return (
      <div>
        <MenuItem
          style={{backgroundColor: 'rgba(69,90,100 ,0.9)', color:'#F2EFE9',}}
          primaryText={formatMessage(messages.delete)}
          onTouchTap={this.handleOpen}
          leftIcon={<Delete color={red500} />}
        />
        <Dialog
          title={this.props.topogramTitle}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          <FormattedMessage {...messages.confirmQuestion} />
        </Dialog>
      </div>
    )
  }
}

export default injectIntl(TopogramDelete)
