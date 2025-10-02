import React from 'react'
import ui from 'redux-ui'

import { MenuItemCompat as MenuItem } from '/imports/startup/client/muiCompat'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

import mapTiles from '../geoMap/mapTiles'

@ui()
export default class GeoMapOptions extends React.Component {

  handleSelectGeoMapTile = (value) => {
    this.props.updateUI('geoMapTile', value)
  }

  render() {
    const mapTilesMenuItems = Object.keys(mapTiles).map( d => (
      <MenuItem
      style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
      color:'#F2EFE9',}}
        value={d}
        key={d}
        primaryText={d.charAt(0).toUpperCase() + d.slice(1)}
        onClick={() => this.handleSelectGeoMapTile(d)}
      />
    ))

    return (
      <MenuItem
        primaryText="Map Background"
        color="#D3E8E6"
        style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
        color:'#F2EFE9',}}
        value={this.props.ui.geoMapTile}
        menuItems={mapTilesMenuItems}
  rightIcon={<ArrowRightIcon />}
      />
    )
  }
}
