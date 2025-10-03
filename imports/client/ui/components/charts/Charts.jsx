import React from 'react'
import PropTypes from 'prop-types'
import ui from '/imports/client/legacyUi'
import { CardCompat as Card, CardTitleCompat as CardTitle, CardActionsCompat as CardActions } from '/imports/startup/client/muiCompat'
import RechartsDonutChart from './RechartsDonutChart.jsx'
import { DEFAULT_COLORS } from '/imports/client/helpers/colors.js'
import { buildSparklinePath } from './sparkline'
import Button from '@mui/material/Button'
import Popup from '/imports/client/ui/components/common/Popup.jsx'

// Robust percentile helper (0..1). Returns NaN for empty arrays.
function percentile(arr, p) {
  if (!Array.isArray(arr) || arr.length === 0) return NaN
  const a = arr.slice().sort((x,y) => x - y)
  const pos = (a.length - 1) * p
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  if (lo === hi) return a[lo]
  const h = pos - lo
  return a[lo] * (1 - h) + a[hi] * h
}

@ui()
class Charts extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      alpha: 0.05,
      showT: true,
      showChi2: true
    }
  }

  componentDidMount() {
    const fire = () => { try { window.dispatchEvent(new Event('resize')) } catch (e) {} }
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(fire)
    setTimeout(fire, 80)
  }

  static propTypes = {
    selectElement: PropTypes.func,
    unselectElement: PropTypes.func
  }

  selectElement = (el) => {
    if (!el) return
    el.data.selected = true
    const { cy } = this.props.ui
    const filter = `${el.group.slice(0,-1)}[id='${el.data.id}']`
    cy.filter(filter).data('selected', true)
    this.props.updateUI('selectedElements', [...this.props.ui.selectedElements, el])
  }

  unselectElement = (el) => {
    if (!el) return
    el.data.selected = false
    const { cy, isolateMode } = this.props.ui
    const filter = `${el.group.slice(0,-1)}[id='${el.data.id}']`
    cy.filter(filter).data('selected', false)
    const remainingElements = this.props.ui.selectedElements.filter(n => !(n.data.id === el.data.id && n.group === el.group))
    this.props.updateUI('selectedElements', remainingElements)
    if (!remainingElements.length && isolateMode) this.handleExitIsolateMode && this.handleExitIsolateMode()
  }

  unselectAllElements = () => {
    const { cy, selectedElements } = this.props.ui
    cy.elements().data('selected', false)
    selectedElements.forEach(el => el.data.selected = false)
    this.props.updateUI('selectedElements', [])
  }

  handleClickChartNodeElement = (payload) => {
    try {
      const id = payload && (payload.id != null ? payload.id : payload.name)
      const target = String(id)
      const { cy } = this.props.ui
      const cyNodes = cy.filter('node')
      const matches = []
      for (let i = 0; i < cyNodes.length; i++) {
        const cyEl = cyNodes[i]
        const w = Number(cyEl && cyEl.data && cyEl.data('weight'))
        if (!isFinite(w)) continue
        const bin = String(Math.round(Math.pow(w, 2)))
        if (bin === target) matches.push(cy.filter(`node[id='${cyEl.data('id')}']`))
      }
      const allSelected = matches.length > 0 && matches.every(elc => !!(elc && elc.data && elc.data('selected')))
      const run = () => { matches.forEach(elc => { allSelected ? this.unselectElement(elc.json()) : this.selectElement(elc.json()) }) }
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run); else setTimeout(run, 0)
    } catch (_) {}
  }

  handleClickChartEdgeElement = (payload) => {
    try {
      const id = payload && (payload.id != null ? payload.id : payload.name)
      const target = String(id)
      const { cy } = this.props.ui
      const cyEdges = cy.filter('edge')
      const matches = []
      for (let i = 0; i < cyEdges.length; i++) {
        const cyEl = cyEdges[i]
        const w = String(cyEl && cyEl.data && cyEl.data('weight'))
        if (w === target) matches.push(cy.filter(`edge[id='${cyEl.data('id')}']`))
      }
      const allSelected = matches.length > 0 && matches.every(elc => !!(elc && elc.data && elc.data('selected')))
      const run = () => { matches.forEach(elc => { allSelected ? this.unselectElement(elc.json()) : this.selectElement(elc.json()) }) }
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run); else setTimeout(run, 0)
    } catch (_) {}
  }

  render() {
    const { cy } = this.props.ui

    // Compute donut data and stats
    let nodesDonutData = []
    let edgesDonutData = []
    let resweig = []
    let resweigEdges = []
    try {
      if (cy && cy._private && cy._private.initrender === false) {
        const cyNodes = cy.filter('node')
        const cyEdges = cy.filter('edge')
        for (let i = 0; i < cyNodes.length; i++) {
          const w = Number(cyNodes[i] && cyNodes[i].data && cyNodes[i].data('weight'))
          if (isFinite(w)) {
            const val = Math.round(Math.pow(w, 2))
            if (isFinite(val)) resweig.push(val)
          }
        }
        for (let i = 0; i < cyEdges.length; i++) {
          const w = Number(cyEdges[i] && cyEdges[i].data && cyEdges[i].data('weight'))
          if (isFinite(w)) resweigEdges.push(w)
        }
        const nodesMap = {}
        resweig.forEach(v => { const k = String(v); nodesMap[k] = (nodesMap[k] || 0) + 1 })
        const edgesMap = {}
        resweigEdges.forEach(v => { const k = String(v); edgesMap[k] = (edgesMap[k] || 0) + 1 })
        const nodesEntries = Object.keys(nodesMap).map(k => [Number(k), nodesMap[k]]).sort((a,b)=>a[0]-b[0])
        const edgesEntries = Object.keys(edgesMap).map(k => [Number(k), edgesMap[k]]).sort((a,b)=>a[0]-b[0])
        nodesDonutData = nodesEntries.map(([name, value]) => ({ name: String(name), value: Number(value) }))
        edgesDonutData = edgesEntries.map(([name, value]) => ({ name: String(name), value: Number(value) }))

        const statistical = require('statistical-js')
        const safe = (arr) => Array.isArray(arr) && arr.length > 0 ? arr : [0]
        const nodesArr = safe(resweig)
        const edgesArr = safe(resweigEdges)
        const summaryNodes = statistical.methods.summary(nodesArr)
        const summaryEdges = statistical.methods.summary(edgesArr)
        let ttestN = null, ttestE = null
        try { ttestN = statistical.methods.tTestOneSample(nodesArr, 4) } catch (_) {}
        try { ttestE = statistical.methods.tTestOneSample(edgesArr, 4) } catch (_) {}
        const distributionType = statistical.methods.poisson
        const distributionTypeEdges = statistical.methods.poisson
        const chi2Nodes = nodesDonutData.length ? statistical.methods.chiSquaredGoodnessOfFit(nodesDonutData.map(d => d.value), distributionType, this.state.alpha) : null
        const chi2Edges = edgesDonutData.length ? statistical.methods.chiSquaredGoodnessOfFit(edgesDonutData.map(d => d.value), distributionTypeEdges, this.state.alpha) : null
        this._stats = {
          nodes: {
            mean: summaryNodes.mean,
            median: Array.isArray(nodesArr) ? nodesArr.slice().sort((a,b)=>a-b)[Math.floor(nodesArr.length/2)] : undefined,
            p25: Array.isArray(nodesArr) ? percentile(nodesArr, 0.25) : undefined,
            p75: Array.isArray(nodesArr) ? percentile(nodesArr, 0.75) : undefined,
            stdev: summaryNodes.standardDeviation || summaryNodes.stddev || summaryNodes.sd,
            n: summaryNodes.count || summaryNodes.n,
            t: ttestN && (ttestN.t || ttestN.statistic),
            p: ttestN && (ttestN.p || ttestN.pvalue || ttestN.pValue)
          },
          edges: {
            mean: summaryEdges.mean,
            median: Array.isArray(edgesArr) ? edgesArr.slice().sort((a,b)=>a-b)[Math.floor(edgesArr.length/2)] : undefined,
            p25: Array.isArray(edgesArr) ? percentile(edgesArr, 0.25) : undefined,
            p75: Array.isArray(edgesArr) ? percentile(edgesArr, 0.75) : undefined,
            stdev: summaryEdges.standardDeviation || summaryEdges.stddev || summaryEdges.sd,
            n: summaryEdges.count || summaryEdges.n,
            t: ttestE && (ttestE.t || ttestE.statistic),
            p: ttestE && (ttestE.p || ttestE.pvalue || ttestE.pValue)
          },
          chi2: { nodes: chi2Nodes, edges: chi2Edges }
        }
        this._resweigRaw = Array.isArray(resweig) ? resweig.slice() : []
        this._resweigEdgesRaw = Array.isArray(resweigEdges) ? resweigEdges.slice() : []
      }
    } catch (_) {}

    // Selected bins
    let selectedNodeNames = new Set()
    let selectedEdgeNames = new Set()
    try {
      const selected = (this.props.ui && this.props.ui.selectedElements) ? this.props.ui.selectedElements : []
      selectedNodeNames = new Set(
        selected
          .filter(el => el && el.group === 'nodes' && el.data && el.data.weight != null)
          .map(el => String(Math.round(Math.pow(el.data.weight, 2))))
      )
      selectedEdgeNames = new Set(
        selected
          .filter(el => el && el.group === 'edges' && el.data && el.data.weight != null)
          .map(el => String(el.data.weight))
      )
      this._nodesBinsKey = Array.from(selectedNodeNames).sort().join(',')
      this._edgesBinsKey = Array.from(selectedEdgeNames).sort().join(',')
    } catch (_) {}

    // Popup size
    const vw = (typeof window !== 'undefined') ? window.innerWidth : 1200
    const vh = (typeof window !== 'undefined') ? window.innerHeight : 800
    const popupWidth = Math.min(900, Math.max(600, Math.round(vw * 0.7)))
    const popupHeight = Math.min(900, Math.max(560, Math.round(vh * 0.8)))

    const palette = Array.isArray(DEFAULT_COLORS) && DEFAULT_COLORS.length ? DEFAULT_COLORS : ['#1976D2','#FB8C00','#43A047','#E53935','#8E24AA','#00897B','#FDD835','#78909C']
    const { showT, showChi2 } = this.state

    return (
      <Popup
        show
        title={'Charts'}
        onClose={() => this.props.updateUI('chartsVisible', false)}
        onPopOut={() => this.setState({ poppedOut: true })}
        width={popupWidth}
        height={popupHeight}
      >
        <div>
          <CardTitle
            title='Charts'
            titleStyle={{ fontSize : '12pt', lineHeight : '1em', color: '#F2EFE9' }}
            subtitle='Nodes repartition (how often the band has played the same venue)'
            subtitleStyle={{ fontSize : '9pt', lineHeight : '1.2em', color: '#F2EFE9' }}
          />
          <RechartsDonutChart
            data={nodesDonutData}
            colors={palette}
            selectedNames={selectedNodeNames}
            onItemClick={(name) => this.handleClickChartNodeElement({ name })}
            title={'nodes'}
            onContainer={(el) => { this._nodesContainer = el }}
            style={{ marginBottom: 8 }}
            key={`nodes-${this._nodesBinsKey || 'none'}`}
          />
          {this._stats && this._stats.nodes ? (
            <div style={{ color:'#F2EFE9', fontSize:'9pt', marginTop: 8 }}>
              <strong>Nodes stats:</strong>
              <span style={{ marginLeft: 8 }}>n={this._stats.nodes.n}</span>
              <span style={{ marginLeft: 8 }}>mean={Number(this._stats.nodes.mean).toFixed(3)}</span>
              <span style={{ marginLeft: 8 }}>sd={Number(this._stats.nodes.stdev || 0).toFixed(3)}</span>
              <span style={{ marginLeft: 8 }}>p25={this._stats.nodes.p25 != null ? Number(this._stats.nodes.p25).toFixed(2) : '—'}</span>
              <span style={{ marginLeft: 8 }}>p50={this._stats.nodes.median != null ? Number(this._stats.nodes.median).toFixed(2) : '—'}</span>
              <span style={{ marginLeft: 8 }}>p75={this._stats.nodes.p75 != null ? Number(this._stats.nodes.p75).toFixed(2) : '—'}</span>
              {showT ? (
                <>
                  <span style={{ marginLeft: 8 }}>t≈{this._stats.nodes.t != null ? Number(this._stats.nodes.t).toFixed(3) : '—'}</span>
                  <span style={{ marginLeft: 8 }}>p≈{this._stats.nodes.p != null ? Number(this._stats.nodes.p).toExponential(2) : '—'}</span>
                </>
              ) : null}
              {showChi2 && this._stats.chi2 && this._stats.chi2.nodes ? (
                <span style={{ marginLeft: 8 }}>chi2={JSON.stringify(this._stats.chi2.nodes)}</span>
              ) : null}
              {Array.isArray(this._resweigRaw) && this._resweigRaw.length > 0 ? (() => {
                const numeric = this._resweigRaw.filter(v => typeof v === 'number' && isFinite(v))
                const s = buildSparklinePath(numeric)
                return (
                  <svg width={s.width} height={s.height} style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                    <path d={s.path} stroke="#80CBC4" strokeWidth="1.5" fill="none" />
                  </svg>
                )
              })() : null}
            </div>
          ) : null}
        </div>

        <div>
          <CardTitle
            subtitle='Edges repartition (how often the band has followed the same route)'
            subtitleStyle={{ fontSize : '9pt', lineHeight : '1.2em', color: '#F2EFE9' }}
          />
          <RechartsDonutChart
            data={edgesDonutData}
            colors={palette}
            selectedNames={selectedEdgeNames}
            onItemClick={(name) => this.handleClickChartEdgeElement({ name })}
            title={'edges'}
            onContainer={(el) => { this._edgesContainer = el }}
            style={{ marginBottom: 8 }}
            key={`edges-${this._edgesBinsKey || 'none'}`}
          />
          {this._stats && this._stats.edges ? (
            <div style={{ color:'#F2EFE9', fontSize:'9pt', marginTop: 8 }}>
              <strong>Edges stats:</strong>
              <span style={{ marginLeft: 8 }}>n={this._stats.edges.n}</span>
              <span style={{ marginLeft: 8 }}>mean={Number(this._stats.edges.mean).toFixed(3)}</span>
              <span style={{ marginLeft: 8 }}>sd={Number(this._stats.edges.stdev || 0).toFixed(3)}</span>
              <span style={{ marginLeft: 8 }}>p25={this._stats.edges.p25 != null ? Number(this._stats.edges.p25).toFixed(2) : '—'}</span>
              <span style={{ marginLeft: 8 }}>p50={this._stats.edges.median != null ? Number(this._stats.edges.median).toFixed(2) : '—'}</span>
              <span style={{ marginLeft: 8 }}>p75={this._stats.edges.p75 != null ? Number(this._stats.edges.p75).toFixed(2) : '—'}</span>
              {showT ? (
                <>
                  <span style={{ marginLeft: 8 }}>t≈{this._stats.edges.t != null ? Number(this._stats.edges.t).toFixed(3) : '—'}</span>
                  <span style={{ marginLeft: 8 }}>p≈{this._stats.edges.p != null ? Number(this._stats.edges.p).toExponential(2) : '—'}</span>
                </>
              ) : null}
              {showChi2 && this._stats.chi2 && this._stats.chi2.edges ? (
                <span style={{ marginLeft: 8 }}>chi2={JSON.stringify(this._stats.chi2.edges)}</span>
              ) : null}
              {Array.isArray(this._resweigEdgesRaw) && this._resweigEdgesRaw.length > 0 ? (() => {
                const numeric = this._resweigEdgesRaw.filter(v => typeof v === 'number' && isFinite(v))
                const s = buildSparklinePath(numeric)
                return (
                  <svg width={s.width} height={s.height} style={{ marginLeft: 8, verticalAlign: 'middle' }}>
                    <path d={s.path} stroke="#FFCC80" strokeWidth="1.5" fill="none" />
                  </svg>
                )
              })() : null}
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 12, margin: '18px 0 46px', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={this.unselectAllElements}
            sx={{ color:'#F2EFE9', borderColor:'#546E7A', height: 40 }}
          >
            Reset selection
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              try {
                const container = this._nodesContainer
                if (!container) return
                const svg = container.querySelector('svg')
                if (!svg) return
                const clone = svg.cloneNode(true)
                const xml = new XMLSerializer().serializeToString(clone)
                const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
                const url = URL.createObjectURL(svgBlob)
                const img = new Image()
                img.onload = () => {
                  const canvas = document.createElement('canvas')
                  canvas.width = img.width
                  canvas.height = img.height
                  const ctx = canvas.getContext('2d')
                  ctx.drawImage(img, 0, 0)
                  URL.revokeObjectURL(url)
                  canvas.toBlob((blob) => {
                    const a = document.createElement('a')
                    a.href = URL.createObjectURL(blob)
                    a.download = 'nodes-chart.png'
                    a.click()
                  }, 'image/png')
                }
                img.src = url
              } catch (_) {}
            }}
            sx={{ color:'#F2EFE9', borderColor:'#546E7A', height: 40 }}
          >
            Export PNG
          </Button>
        </div>
      </Popup>
    )
  }
}

export default Charts
