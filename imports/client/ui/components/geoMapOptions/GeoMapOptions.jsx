import React from 'react'
import ui from '/imports/client/legacyUi'

import { MenuItemCompat as MenuItem } from '/imports/startup/client/muiCompat'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

import mapTiles from '../geoMap/mapTiles'

@ui()
export default class GeoMapOptions extends React.Component {

  handleSelectGeoMapTile = (value) => {
    this.props.updateUI('geoMapTile', value)
  }

  render() {
    const { geoMapTile } = this.props.ui

    const mapTilesMenuItems = Object.keys(mapTiles).map( d => (
      <MenuItem
      style={{ backgroundColor: 'rgba(69,90,100,0.98)', color:'#F2EFE9' }}
        value={d}
        key={d}
        primaryText={d.charAt(0).toUpperCase() + d.slice(1)}
        selected={geoMapTile === d}
        onClick={() => this.handleSelectGeoMapTile(d)}
      />
    ))

    return (
      <MenuItem
        primaryText="Map Background"
        secondaryText={geoMapTile ? geoMapTile : undefined}
        style={{
          backgroundColor: 'rgba(69,90,100,0.9)',
          color: '#F2EFE9'
        }}
        endAdornment={<ArrowRightIcon />}
        menuItems={mapTilesMenuItems}
      />
    )
  }
}
