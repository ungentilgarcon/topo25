import React from 'react'

import { DialogCompat as Dialog, MenuItemCompat as MenuItem } from '/imports/startup/client/muiCompat'
import Button from '@mui/material/Button'
import InfoIcon from 'material-ui/svg-icons/action/info'
import Version from './Version.jsx'


class About extends React.Component {

  constructor(props) {
    super(props)
    this.state = { open: false }
  }

  handleOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  render() {
    const actions = [
      <Button
        variant="contained"
        onClick={this.handleClose}
        sx={{ bgcolor: 'rgba(69,90,100 ,0.9)', color: '#F2EFE9', '&:hover': { bgcolor: 'rgba(55,71,79,0.9)' } }}
      >
        Close
      </Button>
    ]
    return (
      <div style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
      color:'#F2EFE9',}}>
        <MenuItem
        style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
        color:'#F2EFE9',}}
          primaryText="About"
          onClick={this.handleOpen}
          leftIcon={<InfoIcon />}
        />
        <Dialog
        style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
        color:'#F2EFE9',}}
          title="About Bandstour and Topogram"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >

          <p>
            BandsTour is a a free and open-source software under GPL V3.
            it is a fork of Topogram...
            Topogram is a free and open-source software  under GPL V3.
            Read more at<a href="http://topogram.io">topogram.io</a>.
          </p>


          <p>
            Please feel free to get in touch at <a href="mailto:greg@grrrndzero.org"></a>.
          </p>
          <p><small>
            BandsTour 2015-2025 (cc). Thanks to Grégory Bahde,Clément Renaud.
            Topogram 2015-2017 (cc). Thanks to Clément Renaud, Grégory Bahde and Lionel Radisson.
          </small></p>
          <Version />
        </Dialog>
      </div>
    )
  }
}

export default About
