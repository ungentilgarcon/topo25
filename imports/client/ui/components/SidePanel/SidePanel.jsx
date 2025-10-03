import React from 'react'
import PropTypes from 'prop-types'
import ui from '/imports/client/legacyUi'

import { DrawerCompat as Drawer } from '/imports/startup/client/muiCompat'
import ClearIcon from '@mui/icons-material/Clear'
import { IconButtonCompat as IconButton } from '/imports/startup/client/muiCompat'

import SidePanelActions from './SidePanelActions.jsx'
import PanelDescription from './PanelDescription.jsx'
import PanelFilters from './PanelFilters.jsx'
import PanelSettings from './PanelSettings.jsx'

import TitleBox from '../titlebox/TitleBox.jsx'
import UserMenu from '../UserMenu.jsx'
import './SidePanel.css'
import { ThemeProvider, createTheme } from '@mui/material/styles'

// Scoped theme for the SidePanel only
const sidePanelTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#aa8dc6' },
    text: { primary: '#F2EFE9' }
  },
  components: {
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(69,90,100,0.98)',
          color: '#F2EFE9',
          border: '1px solid rgba(255,255,255,0.15)'
        }
      }
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#F2EFE9',
          '&.Mui-selected, &.Mui-selected.Mui-focusVisible': {
            backgroundColor: 'rgba(170,141,198,0.22)'
          },
          '&.Mui-focusVisible, &:hover': {
            backgroundColor: 'rgba(170,141,198,0.12)'
          }
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#B0BEC5',
          '&.Mui-checked': { color: '#aa8dc6' }
        }
      }
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          color: '#F2EFE9',
          fontWeight: 600,
          fontSize: '13px',
          lineHeight: 1.1,
          paddingLeft: 16,
          paddingRight: 16
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(69,90,100,0.95)',
          color: '#F2EFE9'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': { color: '#CFD8DC' },
          '& .MuiInputBase-input': { color: '#F2EFE9' }
        }
      }
    }
  }
})

@ui()
export default class SidePanel extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      panelName : 'about'
    }
  }

  handleExpandChange = () =>
    this.props.updateUI('filterPanelIsOpen', false)

  setPanelName = (panelName) => this.setState({panelName})

  handleClearSelection = () => this.props.unselectAllElements()


  render() {

    const {panelName} = this.state

    const {
      topogram,
      nodes,
      edges,
      hasTimeInfo,
      hasGeoInfo,
      hasCharts,
      onFocusElement,
      onUnfocusElement,
      selectElement,
      unselectElement,
      authorIsLoggedIn,
      user,
      router,
      nodeCategories
    } = this.props

    const {
      cy,
      selectedElements,
      filterPanelIsOpen,
      focusElement,
      geoMapVisible,
      chartsVisible,
      legendVisible
    } = this.props.ui

    return (
      <ThemeProvider theme={sidePanelTheme}>
      <Drawer
        containerStyle={{

          boxShadow: '1px 1px 8px  #000',
          border: '1px solid #222',
          backgroundColor: 'rgba(69,90,100 ,0.9)',
          color:'#F2EFE9',
         //margin: '20px 2px',

         //align: 'left',
         //marginBottom: '10px',
         borderTopLeftRadius: '20px',
         borderBottomLeftRadius: '20px',
         //padding:"2px 2px 15px 15px ",
         transitionEnabled: "true",}}
        width={220}
        height={10}
        openSecondary={true}
        open={filterPanelIsOpen}

        >

        <IconButton
          onClick={this.handleExpandChange}
          style={{ float:'right', zIndex : 20000, color: '#aa8dc6' }}
        >
          <ClearIcon />
        </IconButton>

        <SidePanelActions
          className={"sidepanel-toolbar"}
          style={{}}
          setPanelName={this.setPanelName}
          user={user}
          router={router}
        />

        {
          panelName === 'main' ?
            <span>
              <PanelFilters

                nodes={nodes}
                nodeCategories={nodeCategories}
                selectElement={selectElement}
                />
            </span>
            :
            null
        }

        {
          panelName === 'about' ?
            <PanelDescription
              topogram={topogram}
              nodesCount={nodes.length}
              edgesCount={edges.length}
              />
            :
            null
        }

        {
          panelName === 'edit' ?
            <PanelSettings
              geoMapVisible={geoMapVisible}
              hasCharts={hasCharts}
              hasTimeInfo={hasTimeInfo}
              hasGeoInfo={hasGeoInfo}
              authorIsLoggedIn={authorIsLoggedIn}
              topogramId={topogram._id}
              topogramTitle={topogram.title}
              topogramIsPublic={topogram.sharedPublic}
              router={router}
            />
          :
            null
        }
      </Drawer>
      </ThemeProvider>
    )
  }
}
