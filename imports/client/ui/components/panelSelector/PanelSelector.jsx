import React, { PropTypes } from 'react'
import ui from 'redux-ui'

import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import Checkbox from 'material-ui/Checkbox'
import './PanelSelector.css'

const buttonStyle = {
  margin: 2,
  padding: '10px 20px',
  backgroundColor: 'rgba(69,90,100 ,0.9)',
  color:'#F2EFE9 !important'
}

@ui({ key: 'PanelSettings', state: { showChevrons: (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('topo.showChevrons') !== null) ? JSON.parse(window.localStorage.getItem('topo.showChevrons')) : true } })
export default class PanelSelector extends React.Component {

  static propTypes = {
    bottom : PropTypes.string,
    hasGeoInfo : PropTypes.bool.isRequired,
    hasTimeInfo : PropTypes.bool.isRequired,
    hasCharts :  PropTypes.bool,
  }

  toggleGeo() {
    this.props.updateUI( 'geoMapVisible', !this.props.ui.geoMapVisible )
  }

  toggleCharts() {
    this.props.updateUI( 'chartsVisible', !this.props.ui.chartsVisible,
  !this.props.hasCharts )
  }
  toggleLegend() {
    this.props.updateUI( 'legendVisible', !this.props.ui.legendVisible )
  }

  toggleChevrons() {
    const cur = this.props.ui.showChevrons
    const next = cur === false ? true : !cur
    this.props.updateUI('showChevrons', next)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('topo.showChevrons', JSON.stringify(next))
      }
      if (typeof window !== 'undefined') {
        const evt = new CustomEvent('topo:showChevronsChanged', { detail: { value: next } })
        window.dispatchEvent(evt)
      }
    } catch (e) {
      // no-op if storage unavailable
    }
  }



  toggleGraph() {
    this.props.updateUI( 'graphVisible', !this.props.ui.graphVisible )
  }

  toggleTimeline() {
    this.props.updateUI( 'timeLineVisible', !this.props.ui.timeLineVisible )
  }

  toggleSelectionPanel() {
    this.props.updateUI( 'selectionPanelPinned', !this.props.ui.selectionPanelPinned )
  }

  render() {
    const {
      timeLineVisible,
      geoMapVisible,
      graphVisible,
      chartsVisible,
      legendVisible,
      showChevrons
    } = this.props.ui

    const {
      bottom,
      hasGeoInfo,
      hasTimeInfo,
      hasCharts,
    } = this.props

    return (
      <Menu
        desktop={true}
        style={{maxWidth:'100%',backgroundColor: 'rgba(69,90,100 ,0.9)',
        color:'#F2EFE9',}}
        >
        <MenuItem style={buttonStyle}>
          <Checkbox
            label={ 'Graph'}
            labelStyle={{backgroundColor: 'rgba(69,90,100 ,0.9)',
            color:'#F2EFE9',}}
            checked={graphVisible}
            onClick={ () => this.toggleGraph()}
          />
        </MenuItem>
        <MenuItem style={buttonStyle}>
          <Checkbox
            label={'Geo'}
            labelStyle={{backgroundColor: 'rgba(69,90,100 ,0.9)',
            color:'#F2EFE9',}}
            checked={geoMapVisible}
            disabled={!hasGeoInfo}
            onClick={ () => this.toggleGeo()}
          />
        </MenuItem>
  <MenuItem style={{...buttonStyle, paddingLeft: 48, paddingTop: 0, paddingBottom: 0, marginBottom: -2}}>
          <Checkbox
            label={'Chevrons'}
            style={{ marginLeft: 0, marginTop: -6, marginBottom: -6 }}
            labelStyle={{
              backgroundColor: 'rgba(69,90,100 ,0.9)',
              color:'#F2EFE9',
              fontSize: 11,
              lineHeight: '14px'
            }}
            iconStyle={{ transform: 'scale(0.8)', transformOrigin: 'left center' }}
            checked={showChevrons !== false}
            onClick={ () => this.toggleChevrons()}
          />
        </MenuItem>
  <MenuItem style={{...buttonStyle, paddingTop: 0, marginTop: -2}}>
          <Checkbox
            label={'Time'}
            labelStyle={{backgroundColor: 'rgba(69,90,100 ,0.9)',
            color:'#F2EFE9',}}
            checked={timeLineVisible}
            disabled={!hasTimeInfo}
            onClick={ () => this.toggleTimeline()}
          />
        </MenuItem>
        <MenuItem style={buttonStyle}>
          <Checkbox
            label={'Charts'}
            labelStyle={{backgroundColor: 'rgba(69,90,100 ,0.9)',
            color:'#F2EFE9',}}
            checked={chartsVisible}
            //disabled={!chartsVisible}
            onClick={ () => this.toggleCharts()}
          />
        </MenuItem>
        <MenuItem style={buttonStyle}>
          <Checkbox
            label={'Legend'}
            labelStyle={{backgroundColor: 'rgba(69,90,100 ,0.9)',
            color:'#F2EFE9',}}
            checked={legendVisible}
            //disabled={!legendVisible}
            onClick={ () => this.toggleLegend()}
          />
        </MenuItem>
        {/* <MenuItem style={buttonStyle}>
          <Checkbox
            label={"Selection"}
            labelStyle={{backgroundColor: 'rgba(69,90,100 ,0.9)',
            color:'#F2EFE9',}}
            checked={selectionPanelPinned}
            onClick={ () => this.toggleSelectionPanel()}
          />
        </MenuItem> */}
      </Menu>
    )
  }
}
