import { colors } from '/imports/client/helpers/colors.js'

let alternate = 1
let txt = ''

// Apply dynamic styles directly on cy to preserve function-valued rules in v3
const NetworkDefaultStyle = (cy) => {
  const s = cy.style()

  s.selector('node').style({
    'font-size': 8,
    'text-valign'() {
      // alternate top/bottom label position
      txt = (alternate % 2 === 0) ? 'top' : 'bottom'
      alternate += 1
      return txt
    },
    'text-halign': 'center',
    'color'(e) {
      let color = 'gray' // default
      if (e.data('group')) color = colors(e.data('group'))
      else if (e.data('color')) color = e.data('color')
      return e.data('selected') ? 'yellow' : color
    },
    'text-outline-color': 'black',
    'text-outline-width': '.2px',
    'text-max-width': 40,
    'text-wrap': 'wrap',
    // cytoscape uses 'autorotate' for edges; nodes text rotation uses angles only via data mappings.
    // The prior '100°' caused no effect; omit to avoid parser issues.
  'min-zoomed-font-size': 3,
    'border-color': '#D84315',
    'background-color'(e) {
      let color = 'steelblue' // default
      if (e.data('group')) color = colors(e.data('group'))
      else if (e.data('color')) color = e.data('color')
      return e.data('selected') ? 'yellow' : color
    },
    'label'(e) {
      return e.data('name') ? e.data('name').trunc(20) : ''
    }
  })

  // node with degree zero
  s.selector('node[[degree = 0]]').style({
    'background-color': '#656565'
  })

  s.selector('node[group="ghosts"]').style({
    'background-opacity': 0.5,
    'border-width': '3',
    'border-color': 'gray',
    'border-opacity': 0.6
  })

  s.selector('edge').style({
    'target-arrow-shape': 'triangle',
    'target-arrow-color'(e) {
      if (e.data('selected')) return 'yellow'
      if (e.data('color')) return e.data('color')
      return '#AAAAAA'
    },
    'line-color'(e) {
      if (e.data('selected')) return 'yellow'
      if (e.data('color')) return e.data('color')
      return '#AAAAAA'
    },
    'width'(e) {
      return e.data('weight') ? e.data('weight') : 0.3
    },
    'opacity'(e) {
      return e.data('selected') ? 0.8 : 0.6
    },
    'font-size': 2,
    'text-rotation': 'autorotate',
    'text-opacity': 1,
    'label'(e) {
      return `${e.data('source')}=>${e.data('target')}`
    }
  })

  // edgehandles helpers
  s.selector('.edgehandles-hover').style({ 'background-color': 'red' })
  s.selector('.edgehandles-preview, .edgehandles-ghost-edge').style({
    'line-color': 'red',
    'target-arrow-color': 'red',
    'source-arrow-color': 'red'
  })

  s.update()
}

// truncate String to make it shorter
String.prototype.trunc = String.prototype.trunc ||
  function (n) {
    return (this.length > n) ? this.substr(0,n-1)+'...' : this
  }

export default NetworkDefaultStyle
