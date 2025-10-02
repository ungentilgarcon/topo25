import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cytoscape from 'cytoscape'
import panzoom from 'cytoscape-panzoom'
import spread from 'cytoscape-spread'
import './Cytoscape.css'
// simple linear scaling to avoid pulling d3-scale dependency
const linearScale = (domain, range) => {
  const [d0, d1] = domain
  const [r0, r1] = range
  const span = d1 - d0
  const outSpan = r1 - r0
  if (span === 0) {
    // avoid division by zero: return midpoint of range
    const mid = r0 + outSpan / 2
    return () => mid
  }
  return (x) => r0 + ((x - d0) / span) * outSpan
}

// register force layout
spread(cytoscape)
panzoom(cytoscape)

const cyStyle = {
  height: '100%',
  width: '100%',
  position: 'fixed',
  top: '0px',
  left: '0',
  zIndex : -1,
  background : "rgba(168,221,207,0.4)"
}
//PANZOOM DEFAULTS
var defaults = {
  position : "float !important",
  align : "center",
  zoomFactor: 0.02, // zoom factor per zoom tick
  zoomDelay: 70, // how many ms between zoom ticks
  minZoom: 0.1, // min zoom level
  maxZoom: 10, // max zoom level
  fitPadding: 50, // padding when fitting
  panSpeed: 10, // how many ms in between pan ticks
  panDistance: 10, // max pan distance per tick
  panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
  panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
  panInactiveArea: 8, // radius of inactive area in pan drag box
  panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
  zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
  fitSelector: undefined, // selector of elements to fit
  animateOnFit: function(){ // whether to animate on fit
    return false;
  },
  fitAnimationDuration: 1000, // duration of animation on fit

  // icon class names (pure CSS fallback; no Font Awesome)
  sliderHandleIcon: 'icon',
  zoomInIcon: 'icon',
  zoomOutIcon: 'icon',
  resetIcon: 'icon'
};



class Cytoscape extends Component {
  cy = null;


  // static propTypes = {
  //   elements : {
  //     nodes : React.PropTypes.array,
  //     edges : React.PropTypes.array
  //   }
  // }
  //

  constructor(props) {
    super(props)
    this.state = { init : false }
  }

  componentDidMount() {

    const { style, elements } = this.props

    const cy = cytoscape({
      container: this._cyelement,
      layout: {
        name: 'preset' // load saved positions
      //  name: 'spread' // load saved positions

      },
      style,
      elements
    })
    cy.panzoom( defaults );

    this.cy = cy

    // console.log(cy);
  }

  shouldComponentUpdate(nextProps) {
    // trigger updates for size changes
    if (nextProps.width !== this.props.width) return true
    if (nextProps.height !== this.props.height) return true

    // trigger updates for layout/radius/init/style changes
    if (nextProps.layoutName !== this.props.layoutName) return true
    if (nextProps.nodeRadius !== this.props.nodeRadius) return true
    if (nextProps.init !== this.props.init) return true
    if (nextProps.style !== this.props.style) return true

    // trigger updates when element counts change (handles mutated arrays with same ref)
    const prevEls = this.props.elements || {}
    const nextEls = nextProps.elements || {}
    const prevNodes = Array.isArray(prevEls) ? prevEls.filter(e => e.group === 'nodes').length : ((prevEls.nodes || []).length)
    const prevEdges = Array.isArray(prevEls) ? prevEls.filter(e => e.group === 'edges').length : ((prevEls.edges || []).length)
    const nextNodes = Array.isArray(nextEls) ? nextEls.filter(e => e.group === 'nodes').length : ((nextEls.nodes || []).length)
    const nextEdges = Array.isArray(nextEls) ? nextEls.filter(e => e.group === 'edges').length : ((nextEls.edges || []).length)
    if (prevNodes !== nextNodes || prevEdges !== nextEdges) return true

    return false
  }

  applyLayout(layoutName) {
    const layoutConfig = {
      name : layoutName,
      animate: false
    }

    if (layoutName == 'spread') {
      layoutConfig.minDist= 50  // Minimum distance between nodes
      layoutConfig.padding= 80
      layoutConfig.fontSize= 11
    }

    this.cy.layout(layoutConfig)
  }

  updateRadiusByWeight() {
    // calculate radius range
    const weights = this.cy.nodes().map( d => d.data('weight') )
    const min = Math.min.apply(Math, weights)
    const max = Math.max.apply(Math, weights)
    // console.log("graph legend : min : ", min," max : ",max," units of weight");
    //onsole.log(max);
    // calculate radius range
    const weightDomain = linearScale([min, max], [5, 15])

    // apply size
    this.cy.style()
      .selector('node')
      .style({
        'width'(e) {
          return weightDomain(e.data('weight'))
        },
        'height'(e) {
          return weightDomain(e.data('weight'))
        }
      }).update()
  }

  updateRadiusByDegree() {
    // calculate radius range
    const degreeDomain = linearScale([
      this.cy.nodes().minDegree(),
      this.cy.nodes().maxDegree()
    ], [6, 40])
    console.log("graph legend : min : ", this.cy.nodes().minDegree()," max : ",this.cy.nodes().maxDegree()," degrees");
    // apply size
    this.cy.style()
      .selector('node')
      .style({
        'width'(e) {
          return degreeDomain(e.degree())
        },
        'height'(e) {

          return degreeDomain(e.degree())
        }
      }).update()
  }

  updateRadius(nodeRadius) {
    nodeRadius === 'weight' ?
      this.updateRadiusByWeight()
      :
      this.updateRadiusByDegree()
  }

  componentDidUpdate(prevProps) {
    if (!this.cy) return

    const { layoutName, nodeRadius, elements, style, width, height } = this.props

    // replace elements/style only when they change
    const prevEls = prevProps.elements || {}
    const currEls = elements || {}
    const prevNodes = Array.isArray(prevEls) ? prevEls.filter(e => e.group === 'nodes').length : ((prevEls.nodes || []).length)
    const prevEdges = Array.isArray(prevEls) ? prevEls.filter(e => e.group === 'edges').length : ((prevEls.edges || []).length)
    const currNodes = Array.isArray(currEls) ? currEls.filter(e => e.group === 'nodes').length : ((currEls.nodes || []).length)
    const currEdges = Array.isArray(currEls) ? currEls.filter(e => e.group === 'edges').length : ((currEls.edges || []).length)

    if (elements !== prevProps.elements || style !== prevProps.style || prevNodes !== currNodes || prevEdges !== currEdges) {
      this.cy.json({ elements, style })
    }

    // apply new layout if any
    if (prevProps.layoutName !== layoutName) {
      this.applyLayout(layoutName)
      if (this.cy) this.cy.fit(undefined, 50)
    }

    // init once when requested
    if (!this.state.init && this.props.init) {
      this.applyLayout(layoutName)
      if (this.cy) this.cy.fit(undefined, 50)
      this.setState({ init: true })
    }

    // keep radius in sync
    if (prevProps.nodeRadius !== nodeRadius || elements !== prevProps.elements) {
      this.updateRadius(nodeRadius)
    }

    // handle container size changes
    if (prevProps.width !== width || prevProps.height !== height) {
      this.cy.resize()
    }
  }

  componentWillUnmount() {
    this.cy.destroy()
  }

  getCy() {
    return this.cy
  }

  render() {
    const { height, width } = this.props
    return (<div
      style={Object.assign({}, cyStyle, { width, height })}
      ref={el => { this._cyelement = el }}
      >
    </div>)
  }
}

Cytoscape.propTypes = {
  elements : PropTypes.object.isRequired,
  width : PropTypes.string.isRequired,
  height : PropTypes.string.isRequired,
  layoutName : PropTypes.string.isRequired,
  nodeRadius : PropTypes.string.isRequired,
  init : PropTypes.bool.isRequired,
  style : PropTypes.object
}

export default Cytoscape
