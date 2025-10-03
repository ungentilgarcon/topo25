import React from 'react'
import PropTypes from 'prop-types'
import ui from '/imports/client/legacyUi'

import Network from '/imports/client/ui/components/network/Network.jsx'
import GeoMap from '/imports/client/ui/components/geoMap/GeoMap.jsx'
import TimeLine from '/imports/client/ui/components/timeLine/TimeLine.jsx'
import Charts from '/imports/client/ui/components/charts/Charts.jsx'
import Legend from '/imports/client/ui/components/legend/Legend.jsx'
@ui()
export default class MainViz extends React.Component {


  render() {

    const {
      topogramId,
      nodes,
      edges,
      hasGeoInfo,
      hasTimeInfo,
      hasCharts,
      onFocusElement,
      onUnfocusElement,
      onClickElement,
      selectElement,
      unselectElement,
      unselectAllElements
     } = this.props


    const {
      timeLineVisible,
      geoMapVisible,
      chartsVisible,
      legendVisible,
      graphVisible,
      fontSizeNetwork,
      SaveNodeMovesToDB


    } = this.props.ui

    const panelsCount = [geoMapVisible, graphVisible]
      .filter(d => d).length

    //const height = timeLineVisible ? '70vh' : '100vh'
    const height = '100vh'

    let width = '100vw'
    if (panelsCount === 2) width = '50vw'

    if (panelsCount === 3) width = '33vw'

    //console.log("logging",this.props.ui.chartsVisible,this.props.ui.hasCharts);
    // Dynamically adjust Leaflet bottom control offset to clear timeline/legend by measuring actual DOM heights
    try {
      const setOffset = () => {
        const root = document.documentElement
        const base = 10
        const tlEl = document.getElementById('timeline-panel')
        const lgEl = document.getElementById('legend-popup')
        const tlH = tlEl ? (tlEl.getBoundingClientRect().height || 0) : 0
        const lgRect = lgEl ? lgEl.getBoundingClientRect() : null
        const viewportH = window.innerHeight || 0
        const lgOverflowBottom = lgRect ? Math.max(0, (lgRect.top + lgRect.height) - viewportH) : 0
        // For legend, prefer overlap into bottom edge if any; otherwise use a small constant footprint
        const lgH = lgRect ? Math.max(lgOverflowBottom, Math.min(80, lgRect.height)) : 0
        const offset = Math.round(Math.max(tlH, lgH) + base)
        root.style.setProperty('--timeline-offset', `${offset}px`)

        // Position network panzoom analogous to Leaflet when side panel is open/closed
        const panelOpen = !!(this.props.ui && this.props.ui.filterPanelIsOpen)
        if (panelOpen) {
          root.style.setProperty('--net-panzoom-left', 'auto')
          root.style.setProperty('--net-panzoom-right', '10px')
        } else {
          root.style.setProperty('--net-panzoom-left', '10px')
          root.style.setProperty('--net-panzoom-right', 'auto')
        }
      }
      // Initial and next-frame calculation
      setOffset()
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(setOffset)
        // Install a single resize listener globally
        if (!window.__topoOffsetListenerInstalled) {
          window.addEventListener('resize', setOffset, { passive: true })
          window.addEventListener('topo:overlay-resize', setOffset, { passive: true })
          window.__topoOffsetListenerInstalled = true
        }
        // Nudge after tiny delay in case panels animate in
        setTimeout(setOffset, 120)
      }
    } catch (e) {
      // no-op if document/window not available
    }
    //console.log("logging",this.props)

    return (
      <div>
        {
          geoMapVisible && hasGeoInfo ?
            <GeoMap
              nodes={ nodes }
              edges={ edges }
              width={ width }
              height={ height }
              onFocusElement={onFocusElement}
              onUnfocusElement={onUnfocusElement}
              selectElement={selectElement}
              unselectElement={unselectElement}
              unselectAllElements={unselectAllElements}
            />
            :
            null
        }
        {
          graphVisible ?
            <Network
              topogramId={ topogramId }
              nodes={ nodes }
              edges={ edges }
              width={ width }
              height={ height }
              onFocusElement={onFocusElement}
              onUnfocusElement={onUnfocusElement}
              selectElement={selectElement}
              unselectElement={unselectElement}
              unselectAllElements={unselectAllElements}
              fontSizeNetwork={fontSizeNetwork}
              SaveNodeMovesToDB={SaveNodeMovesToDB}
            />
            :
            null
        }
        {
          this.props.ui.timeLineVisible ?
            <TimeLine
              hasTimeInfo={hasTimeInfo}
            />
            :
            null
        }
        {
          this.props.ui.chartsVisible && this.props.ui.hasCharts ?

            <Charts
              hasCharts={hasCharts}
              chartsVisible={chartsVisible}
            />
            :
            null
        }
        {
          this.props.ui.legendVisible?

            <Legend
              legendVisible={legendVisible}
            />
            :
            null
        }

      </div>
    )
  }
}

MainViz.propTypes = {
  topogramId: PropTypes.string.isRequired,
  nodes: PropTypes.array,
  edges: PropTypes.array,
  hasGeoInfo : PropTypes.bool,
  hasTimeInfo :  PropTypes.bool,
  hasCharts : PropTypes.bool,
  fontSizeNetwork :PropTypes.number.isRequired,
  SaveNodeMovesToDB:PropTypes.bool.isRequired,
  onFocusElement : PropTypes.func.isRequired,
  onUnfocusElement : PropTypes.func.isRequired,
  selectElement : PropTypes.func.isRequired,
  unselectElement : PropTypes.func.isRequired,
  unselectAllElements : PropTypes.func.isRequired
}
