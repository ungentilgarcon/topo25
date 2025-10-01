import React from 'react'
import PropTypes from 'prop-types'
import { FeatureGroup, Polyline, Marker } from 'react-leaflet'
import L from 'leaflet'
import ui from 'redux-ui'

@ui({ key: 'PanelSettings' })
export default class GeoEdges extends React.Component {
  static propTypes = {
    edges : PropTypes.array.isRequired,
    isolateMode : PropTypes.bool,
    handleClickGeoElement : PropTypes.func.isRequired,
    onFocusElement : PropTypes.func.isRequired,
    onUnfocusElement : PropTypes.func.isRequired
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      // Initialize local chevron state from storage or props
      try {
        const ls = window.localStorage ? window.localStorage.getItem('topo.showChevrons') : null
        if (ls !== null) {
          this.setState({ chevronsOn: JSON.parse(ls) })
        }
      } catch (e) {}
      this._onShowChevronsChanged = (evt) => {
        const val = evt && evt.detail && typeof evt.detail.value === 'boolean' ? evt.detail.value : undefined
        if (typeof val === 'boolean') {
          this.setState({ chevronsOn: val })
        } else {
          // Fallback, read from storage
          try {
            const ls = window.localStorage ? window.localStorage.getItem('topo.showChevrons') : null
            if (ls !== null) this.setState({ chevronsOn: JSON.parse(ls) })
            else this.forceUpdate()
          } catch (e) { this.forceUpdate() }
        }
      }
      window.addEventListener('topo:showChevronsChanged', this._onShowChevronsChanged)
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined' && this._onShowChevronsChanged) {
      window.removeEventListener('topo:showChevronsChanged', this._onShowChevronsChanged)
      this._onShowChevronsChanged = null
    }
  }

  // Return segments and chevrons for an edge, splitting at the antimeridian when needed
  buildSegmentsAndChevrons(coords, color, selected, label) {
    if (!coords || coords.length !== 2) return { segments: [], chevrons: [] }
    let [[lat1, lng1], [lat2, lng2]] = coords
    lat1 = parseFloat(lat1); lng1 = parseFloat(lng1)
    lat2 = parseFloat(lat2); lng2 = parseFloat(lng2)

    // Normalize longitudes into [-180, 180]
    const norm = lng => {
      let x = lng
      while (x > 180) x -= 360
      while (x < -180) x += 360
      return x
    }
    lng1 = norm(lng1); lng2 = norm(lng2)

  const delta = lng2 - lng1

    // No split if shortest longitudinal delta is within [-180, 180]
    if (!isFinite(lat1) || !isFinite(lng1) || !isFinite(lat2) || !isFinite(lng2)) {
      return { segments: [], chevrons: [] }
    }
    // Compute wrapped minimal longitudinal delta in [-180, 180]
    const wrappedDelta = ((delta + 540) % 360) - 180
    if (Math.abs(delta) <= 180) {
      return { segments: [ [[lat1, lng1], [lat2, lng2]] ], chevrons: [] }
    }

    // We cross the date line. Determine wrapped direction and nearest boundary seam.
    const dirSign = wrappedDelta >= 0 ? 1 : -1
    // Distance along chosen direction from a to b on circle
    const distAlong = (a, b, sign) => sign > 0 ? ((b - a + 360) % 360) : ((a - b + 360) % 360)
  // Boundary is determined by wrapped direction: east crosses +180, west crosses -180
  const boundaryLng = dirSign > 0 ? 180 : -180
  const otherBoundaryLng = boundaryLng === 180 ? -180 : 180

    // Fraction to reach the seam along the wrapped path
    const total = Math.abs(wrappedDelta) // in (0, 180]
  const toSeam = distAlong(lng1, boundaryLng, dirSign)
    let t = total > 0 ? (toSeam / total) : 0
    if (!isFinite(t)) t = 0
    if (t < 0) t = 0
    if (t > 1) t = 1
    const latInt = lat1 + t * (lat2 - lat1)
    if (!isFinite(latInt)) {
      return { segments: [ [[lat1, lng1], [lat2, lng2]] ], chevrons: [] }
    }

  const seamA = [latInt, boundaryLng]
  // Move the partner seam onto the opposite boundary within normalized range
  const seamB = [latInt, otherBoundaryLng]
    if (!isFinite(seamA[0]) || !isFinite(seamA[1]) || !isFinite(seamB[0]) || !isFinite(seamB[1])) {
      return { segments: [ [[lat1, lng1], [lat2, lng2]] ], chevrons: [] }
    }

    // Two segments: start -> seamA, seamB -> end
    const segments = [
      [[lat1, lng1], seamA],
      [seamB, [lat2, lng2]]
    ]

    // Chevron glyph and placement at both seams
    const glyph = dirSign > 0 ? '\u00BB' /* » eastward */ : '\u00AB' /* « westward */
    const makeIcon = (g, col, label) => L.divIcon({
      className: 'geo-chevron',
      html: `<span class="chev" style="color:${col}; border-color:${col}; white-space:nowrap; display:inline-flex; align-items:center; gap:2px;">
               <b style="line-height:1">${g}</b><em class="chev-n" style="color:#000; line-height:1;">${label != null ? label : ''}</em>
             </span>`,
      iconSize: [0, 0]
    })

    const chevrons = [
      { position: seamA, icon: makeIcon(glyph, color, label), key: `chev-a-${latInt}-${boundaryLng}` , boundary: boundaryLng },
      { position: seamB, icon: makeIcon(glyph, color, label), key: `chev-b-${latInt}-${otherBoundaryLng}`, boundary: otherBoundaryLng }
    ]

    return { segments, chevrons }
  }

  render() {
    const {
      isolateMode,
      handleClickGeoElement,
      onFocusElement,
      onUnfocusElement
     } = this.props

    const children = []
    const isChevronsOn = (this.state && typeof this.state.chevronsOn === 'boolean')
      ? this.state.chevronsOn
      : (!this.props.ui || this.props.ui.showChevrons !== false)
    const seamSlots = { '180': new Map(), '-180': new Map() }
    const getOffsetLat = (boundary, lat) => {
      const key = boundary === 180 ? '180' : '-180'
      const bucket = Math.round(lat * 10) / 10 // 0.1° buckets
      const map = seamSlots[key]
      const n = map.has(bucket) ? map.get(bucket) : 0
      const step = 0.12 // degrees of latitude per slot
      const mult = Math.floor(n / 2) + 1
      const sign = (n % 2 === 0) ? 1 : -1
      const offset = mult * step * sign
      map.set(bucket, n + 1)
      return offset
    }
    // Decide behavior per toggle: when chevrons are off, draw direct single segments
  this.props.edges.forEach( (e,i) => {
      const label = i + 1
      const color = e.selected ? 'yellow' : (e.data.color ? e.data.color : 'purple')
      const weight = e.data.weight ? (e.data.weight > 6 ? 20 : Math.pow(e.data.weight,2)) : 1
      const dashArray = e.data.group ? (
        e.data.group.includes("DASHED2")?"5,2":
        e.data.group.includes("DASHED1")?"5,4":
        e.data.group.includes("DASHED-2")?"5,2,2,5,2,2,5":
        e.data.group.includes("DASHED-1")? "1,5,1,5,1":
        ""
      ) : ""
      // Read UI toggle once per edge to drive splitting behavior
  const showChevrons = isChevronsOn
      let segments = []
      let chevrons = []
      if (showChevrons) {
        const built = this.buildSegmentsAndChevrons(e.coords, color, e.selected, label)
        segments = built.segments
        chevrons = built.chevrons
      } else {
        // Direct connection: a single segment without splitting/chevrons
        if (e.coords && e.coords.length === 2) {
          let [[lat1, lng1], [lat2, lng2]] = e.coords
          lat1 = parseFloat(lat1); lng1 = parseFloat(lng1)
          lat2 = parseFloat(lat2); lng2 = parseFloat(lng2)
          if (isFinite(lat1) && isFinite(lng1) && isFinite(lat2) && isFinite(lng2)) {
            segments = [ [[lat1, lng1], [lat2, lng2]] ]
          }
        }
      }
      if (segments && segments.length) {
        segments.forEach((seg, sIdx) => {
          children.push(
            <Polyline
              key={`edge-${i}-seg-${sIdx}-${(!this.props.ui || this.props.ui.showChevrons !== false) ? 'with' : 'no'}-chev`}
              opacity={"0.8"}
              color={color}
              weight={weight}
              dashArray={dashArray}
              positions={seg}
              onClick={() => !isolateMode ? handleClickGeoElement({ group : 'edge', el: e }) : null }
              onMouseDown={() => isolateMode ? onFocusElement(e) : null }
              onMouseUp={()=> isolateMode ? onUnfocusElement() : null }
            />
          )
          // Invisible hit area: larger weight, nearly transparent
          const hitWeight = Math.max(weight, 24)
          children.push(
            <Polyline
              key={`edge-${i}-seg-${sIdx}-hit-${(!this.props.ui || this.props.ui.showChevrons !== false) ? 'with' : 'no'}-chev`}
              opacity={0.001}
              color={color}
              weight={hitWeight}
              bubblingMouseEvents={false}
              positions={seg}
              onClick={() => !isolateMode ? handleClickGeoElement({ group : 'edge', el: e }) : null }
              onMouseDown={() => isolateMode ? onFocusElement(e) : null }
              onMouseUp={()=> isolateMode ? onUnfocusElement() : null }
            />
          )
        })
      }
      // Only render chevrons when enabled
      if (isChevronsOn && chevrons && chevrons.length) {
        chevrons.forEach((ch, cIdx) => {
          let lat = parseFloat(ch.position[0])
          let lng = parseFloat(ch.position[1])
          if (!isFinite(lat) || !isFinite(lng)) return
          // Apply small stacking offset in latitude to improve visibility
          const boundary = ch.boundary
          if (boundary === 180 || boundary === -180) {
            lat = lat + getOffsetLat(boundary, lat)
          }
          children.push(
            <Marker
              key={`${ch.key}-${i}-${cIdx}-${(!this.props.ui || this.props.ui.showChevrons !== false) ? 'with' : 'no'}-chev`}
              position={[lat, lng]}
              icon={ch.icon}
              interactive={true}
              onClick={() => !isolateMode ? handleClickGeoElement({ group : 'edge', el: e }) : null }
            />
          )
        })
      }
    })

  const uiKey = isChevronsOn ? 'with-chevrons' : 'no-chevrons'
    return (
      <FeatureGroup name="GeoEdges"
        pane="edgesPane"
        key={`edges-${uiKey}`}
        ref={(el) => { this._edgesGroup = el }}>
        {children}
      </FeatureGroup>
    )
  }
}
