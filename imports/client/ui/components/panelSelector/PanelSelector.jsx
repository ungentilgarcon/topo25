import React from 'react'
import PropTypes from 'prop-types'
import ui from '/imports/client/legacyUi'

// Render simple blocks; use CheckboxCompat for MUI v5
import { CheckboxCompat as Checkbox } from '/imports/startup/client/muiCompat'
import './PanelSelector.css'

const buttonStyle = {
  margin: '1px 8px',
  padding: '4px 12px',
  backgroundColor: 'rgba(69,90,100 ,0.9)',
  color:'#F2EFE9'
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
      <div style={{ maxWidth: '100%', backgroundColor: 'rgba(69,90,100 ,0.9)', color: '#F2EFE9', paddingTop: 4 }}>
        <div style={{ ...buttonStyle, marginTop: 1 }}>
          <Checkbox
            label={'Graph'}
            size={'small'}
            labelStyle={{ backgroundColor: 'rgba(69,90,100 ,0.9)', color: '#F2EFE9' }}
            checked={graphVisible}
            onClick={() => this.toggleGraph()}
          />
        </div>
        <div style={{ ...buttonStyle, marginTop: 1 }}>
          <Checkbox
            label={'Geo'}
            size={'small'}
            labelStyle={{ backgroundColor: 'rgba(69,90,100 ,0.9)', color: '#F2EFE9' }}
            checked={geoMapVisible}
            disabled={!hasGeoInfo}
            onClick={() => this.toggleGeo()}
          />
        </div>
        <div style={{ ...buttonStyle, paddingLeft: 44, paddingTop: 0, paddingBottom: 0, marginTop: 0, marginBottom: -4 }}>
          <Checkbox
            label={'Chevrons'}
            size={'small'}
            style={{ marginLeft: 0, marginTop: -8, marginBottom: -8, padding: 0 }}
            labelStyle={{
              backgroundColor: 'rgba(69,90,100 ,0.9)',
              color: '#F2EFE9',
              fontSize: 10,
              lineHeight: '12px'
            }}
            iconStyle={{ transform: 'scale(0.75)', transformOrigin: 'left center' }}
            checked={showChevrons !== false}
            onClick={() => this.toggleChevrons()}
          />
        </div>
        <div style={{ ...buttonStyle, paddingTop: 0, marginTop: 1 }}>
          <Checkbox
            label={'Time'}
            size={'small'}
            labelStyle={{ backgroundColor: 'rgba(69,90,100 ,0.9)', color: '#F2EFE9' }}
            checked={timeLineVisible}
            disabled={!hasTimeInfo}
            onClick={() => this.toggleTimeline()}
          />
        </div>
        <div style={{ ...buttonStyle, marginTop: 1 }}>
          <Checkbox
            label={'Charts'}
            size={'small'}
            labelStyle={{ backgroundColor: 'rgba(69,90,100 ,0.9)', color: '#F2EFE9' }}
            checked={chartsVisible}
            onClick={() => this.toggleCharts()}
          />
        </div>
        <div style={{ ...buttonStyle, marginTop: 1 }}>
          <Checkbox
            label={'Legend'}
            size={'small'}
            labelStyle={{ backgroundColor: 'rgba(69,90,100 ,0.9)', color: '#F2EFE9' }}
            checked={legendVisible}
            onClick={() => this.toggleLegend()}
          />
        </div>
      </div>
    )
  }
}
