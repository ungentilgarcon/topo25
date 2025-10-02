import React from 'react'
import PropTypes from 'prop-types'

import ModeEdit from '@mui/icons-material/ModeEdit'
import { DialogCompat as Dialog, TextFieldCompat as TextField, MenuItemCompat as MenuItem } from '/imports/startup/client/muiCompat'
import Button from '@mui/material/Button'

import { topogramUpdateTitle } from '../../../../api/topograms/topogramsMethods.js'

export default class TopogramEditTitle extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      title: this.props.topogramTitle,
      open: false
    }
  }

  static propTypes = {
    topogramTitle : PropTypes.string,
    topogramId : PropTypes.string
  }

  handleTitleChange = (event) => {
    this.setState({ title : event.target.value })
  }

  handleClickUpdateTitle = () => {
    topogramUpdateTitle.call({
      topogramId : this.props.topogramId,
      title : this.state.title
    })

    this.handleClose()
  }

  handleOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  render() {

    const actions = [
      <Button key="cancel" variant="text" onClick={this.handleClose}>Cancel</Button>,
      <Button key="update" variant="contained" onClick={this.handleClickUpdateTitle}>Update Title</Button>
    ]

    return (
      <div>
        <MenuItem
          style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
          color:'#F2EFE9',}}
          primaryText="Update Title"
          onClick={this.handleOpen}
          leftIcon={<ModeEdit />}
        />
        <Dialog
        style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
        color:'#F2EFE9',}}
          title={this.props.topogramTitle}
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          <TextField
          style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
          color:'#F2EFE9',}}
            floatingLabelText="Edit Title"
            fullWidth={true}
            value={this.state.title}
            onChange={this.handleTitleChange}
            floatingLabelFixed={true}
            multiLine={true}
          />
        </Dialog>
      </div>
    )
  }
}
