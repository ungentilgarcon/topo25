import React from 'react'
import PropTypes from 'prop-types'
import ui from '/imports/client/legacyUi'
import d3 from 'd3'
import { Map, TileLayer,ScaleControl,ZoomControl, Pane } from 'react-leaflet'
//import {smoothZoom} from 'leaflet.smoothzoom'

import 'leaflet/dist/leaflet.css'
import './GeoMap.css'

import mapTiles from './mapTiles'
import GeoNodes from './GeoNodes.jsx'
import GeoEdges from './GeoEdges.jsx'

const MAP_DIV_ID = 'map'
const divMapStyle = {
  position: 'fixed',
  top: '0',
  zIndex : -1
}

@ui()
class GeoMap extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      zoom : 2.4,
      position : [20.505, 22]
    }
    // Track tile errors to detect blocked providers and auto-fallback
    this._tileErrorCount = 0
    this._lastTileKey = null
  }

  static propTypes = {
    nodes : PropTypes.array,
    edges : PropTypes.array,
    width : PropTypes.string.isRequired,
    height : PropTypes.string.isRequired,
    selectElement : PropTypes.func.isRequired,
    unselectElement : PropTypes.func.isRequired,
    onFocusElement: PropTypes.func.isRequired,
    onUnfocusElement: PropTypes.func.isRequired
  }

  handleClickGeoElement({group, el}) {
    const {cy} = this.props.ui
    console.log("group",`${group}`);
    console.log("${el.data.id}",el.data.id);
    const filter = `${group}[id='${el.data.id}']`
    console.log(filter);
    const cyEl = cy.filter(filter)
    console.log(cyEl);
    cyEl.data('selected') ?
      this.props.unselectElement(cyEl.json())
      :
      this.props.selectElement(cyEl.json())
  }

  render() {
    const nodesById = {}

    const {
      geoMapTile,
      isolateMode,
      cy
    } = this.props.ui

    const {
      zoom,
      position
    } = this.state

    const {
      width,
      height,
      onFocusElement,
      onUnfocusElement
    } = this.props

    // resize dynamically using d3
    d3.select('.leaflet-container')
      .style('width', width)
    const left = width === '50vw' ? '50vw' : 0

    const nodes = (this.props.nodes || [])
      .map( n => {
        const lat = parseFloat(n.data.lat)
        const lng = parseFloat(n.data.lng)
        if (!isFinite(lat) || !isFinite(lng)) return null
        const coords = [lat, lng]
        const node = { ...n, coords }
        nodesById[n.data.id] = node // store for edges
        return node
      })
      .filter(Boolean)

    const edges = (this.props.edges || [])
      .map( e => {
        const source = nodesById[e.data.source]
        const target = nodesById[e.data.target]
        if (!source || !target) return null
        const coords = [source.coords, target.coords]
        const selected = e.data.selected
        return { ...e, source, target, coords, selected }
      })
      .filter(Boolean)

    const {
      url,
      attribution,
      minZoom,
      maxZoom,
      ext
    } = mapTiles[geoMapTile]
    // Clamp zoom to integer to avoid 404s on providers that don't serve fractional zoom
    const intZoom = Math.max(minZoom || 0, Math.min(maxZoom || 22, Math.round(this.state.zoom)))
    if (intZoom !== this.state.zoom) {
      // Update once to round zoom, avoiding render loops by only setting when different
      this.state.zoom = intZoom
    }
    const tileKey = `${geoMapTile}:${url || 'none'}`
    if (this._lastTileKey !== tileKey) {
      // Reset error counter when switching tile providers
      this._tileErrorCount = 0
      this._lastTileKey = tileKey
    }

    const chevOn = (!this.props.ui || this.props.ui.showChevrons !== false)
    return (
      <div
        id={MAP_DIV_ID}
        style={Object.assign({}, divMapStyle,{ left, height })}
      >
        <Map
          key={`map-${chevOn ? 'with' : 'no'}-chev`}
          center={position}
          zoom={zoom}
          zoomSnap={1}
          zoomDelta={1}
          zoomControl= {false}


          ref={el => { this._map = el }}
        >
          {
            edges.length ? (
              <Pane name="edgesPane" style={{ zIndex: 600 }}>
                <GeoEdges
                  key={`geoedges-${(!this.props.ui || this.props.ui.showChevrons !== false) ? 'with' : 'no'}-chev`}
                  edges={edges}
                  isolateMode={isolateMode}
                  handleClickGeoElement={(e) => this.handleClickGeoElement(e)}
                  onFocusElement={onFocusElement}
                  onUnfocusElement={onUnfocusElement}
                />
              </Pane>
            ) : null
          }
          {
            nodes.length ? (
              <Pane name="nodesPane" style={{ zIndex: 650 }}>
                <GeoNodes
                  nodes={nodes}
                  isolateMode={isolateMode}
                  handleClickGeoElement={(e) => this.handleClickGeoElement(e)}
                  onFocusElement={onFocusElement}
                  onUnfocusElement={onUnfocusElement}
                />
              </Pane>
            ) : null
          }
          {url ? (
            <TileLayer
              url={url}
              attribution={attribution}
              minZoom={minZoom}
              maxZoom={maxZoom}
              ext={ext}
              crossOrigin={'anonymous'}
              subdomains={mapTiles[geoMapTile] && mapTiles[geoMapTile].subdomains}
              errorTileUrl={"data:image/gif;base64,R0lGODlhAQABAAAAACw="}
              detectRetina={false}
              tms={mapTiles[geoMapTile] && mapTiles[geoMapTile].tms}
              onTileerror={() => {
                this._tileErrorCount += 1
                if (this._tileErrorCount >= 6) {
                  try { console.warn('Tile errors detected; falling back to default base map') } catch(e) {}
                  this.props.updateUI && this.props.updateUI('geoMapTile', 'default')
                  this._tileErrorCount = 0
                }
              }}
            />
          ) : null}
          <ScaleControl
            position='bottomright'
          />

        <ZoomControl
          position='bottomright'
          />
        </Map>
      </div>
    )
  }
}

export default GeoMap
