import React from 'react'
import PropTypes from 'prop-types'

import { MenuItemCompat as MenuItem, DialogCompat as Dialog } from '/imports/startup/client/muiCompat'
import Button from '@mui/material/Button'
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
      <Button key="cancel" variant="text" onClick={this.handleClose}>{formatMessage(messages.cancel)}</Button>,
      <Button key="delete" variant="contained" onClick={this._deleteItem} sx={{ bgcolor: 'rgba(69,90,100 ,0.9)', color: '#F2EFE9', '&:hover': { bgcolor: 'rgba(55,71,79,0.9)' }}}>
        {formatMessage(messages.delete)}
      </Button>,
    ]
    return (
      <div>
        <MenuItem
          style={{backgroundColor: 'rgba(69,90,100 ,0.9)', color:'#F2EFE9',}}
          primaryText={formatMessage(messages.delete)}
          onClick={this.handleOpen}
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
