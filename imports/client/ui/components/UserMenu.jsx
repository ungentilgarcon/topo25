import React from 'react'
import PropTypes from 'prop-types'

// import { messages } from '../../../i18n.js'

import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import { SubheaderCompat as Subheader, MenuItemCompat as MenuItem, IconButtonCompat as IconButton } from '/imports/startup/client/muiCompat'

import MoreVertIcon from '@mui/icons-material/MoreVert'
import Home from '@mui/icons-material/Home'

import About from './About.jsx'
import UserNameEdit from './users/UserNameEdit.jsx'

export default class UserMenu extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      anchorEl: null,
      userNameOpen :false
     }
  }

  static propTypes = {
    router : PropTypes.shape({
      push : PropTypes.func
    }),
    user : PropTypes.shape({
      isLoggedIn : PropTypes.bool
    }),
    style : PropTypes.object
  }

  logout() {
    Meteor.logout(err => {
      if (err) throw err
      // else TODO : snackbar console.log('logout')
    })
  }

  render() {
    const { isLoggedIn } = this.props.user
    const { anchorEl } = this.state
    const menuOpen = Boolean(anchorEl)
    // const currentLanguage = 'en'
    // const languageMenuItems = Object.keys(messages).map( l => {
    //   const abbr = l.split('-')[0]
    //   return (
    //     <MenuItem
    //       value={l}
    //       key={l}
    //       primaryText={abbr}
    //       checked={currentLanguage === abbr}
    //     />
    //   )
    // })

      return (
        <span >
          <UserNameEdit
            userName={this.props.user.username}
            open={this.state.userNameOpen}
            handleClose={() => this.setState({userNameOpen : false})}
            />

          <IconButton
            onClick={(e) => this.setState({ anchorEl: e.currentTarget })}
            style={this.props.style}
            aria-controls={menuOpen ? 'user-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={menuOpen ? 'true' : undefined}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={() => this.setState({ anchorEl: null })}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            keepMounted
            PaperProps={{ sx: { backgroundColor: 'rgba(69,90,100 ,0.9)', color:'#F2EFE9' } }}
          >
            <MenuItem style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
            color:'#F2EFE9',}}
              primaryText="Home"
              leftIcon={<Home />}
              onClick={() => { this.setState({ anchorEl: null }); this.props.router.push('/') }}
            />
            <About
              style={{backgroundColor: 'rgba(69,90,100 ,0.9)', color:'#F2EFE9'}}
              onOpen={() => this.setState({ anchorEl: null })}
            />
            {/*
          <Divider />
          <MenuItem
            primaryText="Language"
            rightIcon={<ArrowDropRight />}
            menuItems={languageMenuItems}
          /> */}

            {
              isLoggedIn ?
                <MenuItem style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
                color:'#F2EFE9',}}
                  primaryText="My Topograms"
                  onClick={() => this.props.router.push('/topograms')}
                />
                :
                null
            }

            <Divider sx={{ borderColor: 'rgba(69,90,100 ,0.9)' }} />
            {
              !isLoggedIn
                ?
                <span style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
                color:'#F2EFE9',}}>
                  <MenuItem
                  style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
                  color:'#F2EFE9',}}
                    primaryText="Login"
                    onClick={() => { this.setState({ anchorEl: null }); this.props.router.push('/login') }}
                  />
                  <MenuItem style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
                  color:'#F2EFE9',}}
                    primaryText="Sign Up"
                    onClick={() => { this.setState({ anchorEl: null }); this.props.router.push('/signup') }}
                  />
                </span>
                :
                <span style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
                color:'#F2EFE9',}}>
                  <Subheader style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
                  color:'#F2EFE9',}}>
                    {
                      this.props.user.username
                    }
                  </Subheader>
                  <MenuItem style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
                  color:'#F2EFE9',}}
                    primaryText="Change Username"
                    onClick={() => this.setState({ userNameOpen: true, anchorEl: null })}
                  />
                  <MenuItem style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
                  color:'#F2EFE9',}}
                    primaryText="Sign out"
                    onClick={() => { this.setState({ anchorEl: null }); this.logout() }}
                  />
                </span>
            }
          </Menu>
        </span>
      )
  }
}

// initalLocale: React.PropTypes.oneOf(appLocales),
