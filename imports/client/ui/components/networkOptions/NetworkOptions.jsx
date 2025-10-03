import React from 'react'
import ui from '/imports/client/legacyUi'

import { MenuItemCompat as MenuItem } from '/imports/startup/client/muiCompat'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

const layouts = [
  'preset',
  'cose', // uncaught 'prototype' Error
  'spread', // CPU overhead
  'random',
  'breadthfirst',
  'concentric'
]
// 'cola', // can not get it to work
// 'arbor', // works quite okay
// 'springy', // force rendering
// 'grid', // uselss layout
// 'circle', // useless as well

@ui()
export default class NetworkOptions extends React.Component {

  handleSelectLayout = (value) => {
    this.props.updateUI('layoutName', value)
  }

  handleSelectNodeRadius = (value) => {
    this.props.updateUI('nodeRadius', value)
  }

  render() {
    const { layoutName, nodeRadius } = this.props.ui

    const layoutMenuItems = layouts.map( d => (
      <MenuItem style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
      color:'#F2EFE9',}}
        value={d}
        key={d}
        primaryText={d.charAt(0).toUpperCase() + d.slice(1)}
        selected={layoutName === d}
        onClick={() => this.handleSelectLayout(d)}
      />
    ))

    const NodeRadiusMenuItems = ['degree', 'weight']
      .map(d => (
        <MenuItem style={{backgroundColor: 'rgba(69,90,100 ,0.9)',
        color:'#F2EFE9',}}
          value={d}
          key={d}
          primaryText={d.charAt(0).toUpperCase() + d.slice(1)}
          selected={nodeRadius === d}
          onClick={() => this.handleSelectNodeRadius(d)}
        />
      ))

    return (
      <div>
        <MenuItem
          style={{ backgroundColor: 'rgba(69,90,100,0.9)', color: '#F2EFE9' }}
          primaryText="Network Layout"
          secondaryText={layoutName ? layoutName : undefined}
          endAdornment={<ArrowRightIcon />}
          menuItems={layoutMenuItems}
        />
        <MenuItem
          style={{ backgroundColor: 'rgba(69,90,100,0.9)', color: '#F2EFE9' }}
          primaryText="Node Radius"
          secondaryText={nodeRadius ? nodeRadius : undefined}
          endAdornment={<ArrowRightIcon />}
          menuItems={NodeRadiusMenuItems}
        />
      </div>
    )
  }
}
