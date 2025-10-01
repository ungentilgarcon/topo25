import React from 'react'
import PropTypes from 'prop-types'

import Button from '@mui/material/Button'
import { DialogCompat as Dialog, TextFieldCompat as TextField } from '/imports/startup/client/muiCompat'

import AccountIcon from 'material-ui/svg-icons/action/account-circle'

import { updateUserName } from '../../../../api/users/userMethods.js'

export default class UserNameEdit extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      userName: this.props.userName
    }
  }

  static propTypes = {
    userName : PropTypes.string,
    open: PropTypes.bool
  }

  handleUserNameChange = (event) =>
    this.setState({ userName : event.target.value })

  handleClickUpdateUsername = () => {
    updateUserName.call({
      userName : this.state.userName
    })

    this.props.handleClose()
  }

  handleOpen = () => this.setState({ open: true })
  handleClose = () => this.setState({ open: false })

  render() {

    const actions = [
      <Button key="cancel" variant="text" onClick={this.props.handleClose}>Cancel</Button>,
      <Button key="update" variant="contained" onClick={this.handleClickUpdateUsername}>Change Username</Button>
    ]

    return (
      <div>
        <Dialog
          title={this.props.userName}
          actions={actions}
          modal={true}
          open={this.props.open}
          onRequestClose={this.props.handleClose}
        >
          <TextField
            floatingLabelText="Edit Username"
            fullWidth={true}
            value={this.state.userName}
            onChange={this.handleUserNameChange}
            floatingLabelFixed={true}
            multiLine={false}
          />
        </Dialog>
      </div>
    )
  }
}
