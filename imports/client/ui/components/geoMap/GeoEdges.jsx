import React, { PropTypes } from 'react'
import { FeatureGroup, Polyline, Marker } from 'react-leaflet'
import L from 'leaflet'
import ui from 'redux-ui'

@ui()
export default class GeoEdges extends React.Component {
  static propTypes = {
    edges : PropTypes.array.isRequired,
    isolateMode : PropTypes.bool,
    handleClickGeoElement : PropTypes.func.isRequired,
    onFocusElement : PropTypes.func.isRequired,
    onUnfocusElement : PropTypes.func.isRequired
  }

  // Return segments and chevrons for an edge, splitting at the antimeridian when needed
  buildSegmentsAndChevrons(coords, color, selected) {
    if (!coords || coords.length !== 2) return { segments: [], chevrons: [] }
    let [[lat1, lng1], [lat2, lng2]] = coords

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
    if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
      return { segments: [], chevrons: [] }
    }
    if (Math.abs(delta) <= 180) {
      return { segments: [ [[lat1, lng1], [lat2, lng2]] ], chevrons: [] }
    }

    // We cross the dateline: choose which meridian we hit first (±180)
    const boundaryLng = delta > 0 ? 180 : -180
    const otherBoundaryLng = boundaryLng === 180 ? -180 : 180

    // Linear interpolation in lon/lat space to find intersection lat at boundaryLng
    const denom = (lng2 - lng1)
    if (!denom) {
      return { segments: [ [[lat1, lng1], [lat2, lng2]] ], chevrons: [] }
    }
    // Clamp t to [0,1] to ensure intersection lies between endpoints
    let t = (boundaryLng - lng1) / denom
    if (t < 0) t = 0
    if (t > 1) t = 1
    const latInt = lat1 + t * (lat2 - lat1)
    if (!isFinite(latInt)) {
      return { segments: [ [[lat1, lng1], [lat2, lng2]] ], chevrons: [] }
    }

    const seamA = [latInt, boundaryLng]
    const seamB = [latInt, otherBoundaryLng]

    // Two segments: start -> seamA, seamB -> end
    const segments = [
      [[lat1, lng1], seamA],
      [seamB, [lat2, lng2]]
    ]

    // Chevron glyph and placement at both seams
    const glyph = delta > 0 ? '\u00BB' /* » eastward */ : '\u00AB' /* « westward */
    const makeIcon = (g) => L.divIcon({
      className: 'geo-chevron',
      html: `<span>${g}</span>`,
      iconSize: [0, 0]
    })

    const chevrons = [
      { position: seamA, icon: makeIcon(glyph), key: `chev-a-${latInt}-${boundaryLng}` },
      { position: seamB, icon: makeIcon(glyph), key: `chev-b-${latInt}-${otherBoundaryLng}` }
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
    this.props.edges.forEach( (e,i) => {
      const color = e.selected ? 'yellow' : (e.data.color ? e.data.color : 'purple')
      const weight = e.data.weight ? (e.data.weight > 6 ? 20 : Math.pow(e.data.weight,2)) : 1
      const dashArray = e.data.group ? (
        e.data.group.includes("DASHED2")?"5,2":
        e.data.group.includes("DASHED1")?"5,4":
        e.data.group.includes("DASHED-2")?"5,2,2,5,2,2,5":
        e.data.group.includes("DASHED-1")? "1,5,1,5,1":
        ""
      ) : ""

      const { segments, chevrons } = this.buildSegmentsAndChevrons(e.coords, color, e.selected)
      if (segments && segments.length) {
        segments.forEach((seg, sIdx) => {
          children.push(
            <Polyline
              key={`edge-${i}-seg-${sIdx}`}
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
        })
      }
      if (chevrons && chevrons.length) {
        chevrons.forEach((ch, cIdx) => {
          children.push(
            <Marker
              key={`${ch.key}-${i}-${cIdx}`}
              position={ch.position}
              icon={ch.icon}
              interactive={false}
            />
          )
        })
      }
    })

    return (
      <FeatureGroup name="GeoEdges"
        ref="edgesGroup">
        {children}
      </FeatureGroup>
    )
  }
}
