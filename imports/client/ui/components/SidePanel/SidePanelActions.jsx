import React from 'react'
import PropTypes from 'prop-types'

import { ToolbarCompat as Toolbar } from '/imports/startup/client/muiCompat'

import { IconButtonCompat as IconButton } from '/imports/startup/client/muiCompat'
import HomeIcon from '@mui/icons-material/Home'
import SettingsIcon from '@mui/icons-material/Settings'
import InfoIcon from '@mui/icons-material/Info'

import UserMenu from '../UserMenu.jsx'

const SidePanelActions = ({
  setPanelName,
  user,
  router,
  className,
  style
}) => (

  <Toolbar
    className={className || 'sidepanel-toolbar'}
    style={{
      position: 'sticky',
      width: '100%',
      top: 0,
      background: 'transparent',
      color: '#aa8dc6',
      ...(style || {})
    }}
  >
    <IconButton onClick={() => setPanelName('edit')}>
      <SettingsIcon />
    </IconButton>
    <IconButton onClick={() => setPanelName('main')}>
      <HomeIcon />
    </IconButton>

    <IconButton onClick={() => setPanelName('about')}>
      <InfoIcon />
    </IconButton>


    <UserMenu
      user={user}
      router={router}
      />
  </Toolbar>
)

export default SidePanelActions
