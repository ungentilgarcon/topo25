import React from 'react'
import PropTypes from 'prop-types'
import { CardTitleCompat as CardTitle, CardTextCompat as CardText, DividerCompat as Divider } from '/imports/startup/client/muiCompat'
import moment from 'moment'
import ReactDOM from 'react-dom'
import Tooltip from '@mui/material/Tooltip'

class Portal extends React.Component {
  componentDidMount() {
    if (typeof document === 'undefined') return
    this.container = document.createElement('div')
    document.body.appendChild(this.container)
    this.forceUpdate()
  }
  componentDidUpdate() { /* portal rerenders via render() */ }
  componentWillUnmount() {
    if (!this.container) return
    document.body.removeChild(this.container)
    this.container = null
  }
  render() {
    if (!this.container) return null
    return ReactDOM.createPortal(this.props.children, this.container)
  }
}

class PanelDescription extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      helpOpen: false,
      // drag state
      dragging: false, startX: 0, startY: 0, left: 40, top: 40,
      // resize state
      resizing: false, resizeStartX: 0, resizeStartY: 0, startWidth: 640, startHeight: 420,
      width: 640, height: 420
    }
  }

  openHelp = () => {
    // center on viewport roughly on open
  const width = this.state.width || 640, height = this.state.height || 420
    const vw = (typeof window !== 'undefined') ? window.innerWidth : 1200
    const vh = (typeof window !== 'undefined') ? window.innerHeight : 800
    const left = Math.max(10, Math.round((vw - width) / 2))
    const top = Math.max(10, Math.round((vh - height) / 2))
    this.setState({ helpOpen: true, left, top })
  }

  closeHelp = () => this.setState({ helpOpen: false })

  handleDragStart = (e) => {
    e.preventDefault()
    this.setState({ dragging: true, startX: e.clientX - this.state.left, startY: e.clientY - this.state.top })
    window.addEventListener('mousemove', this.handleDragMove)
    window.addEventListener('mouseup', this.handleDragEnd)
  }

  handleDragMove = (e) => {
    if (!this.state.dragging) return
    const left = e.clientX - this.state.startX
    const top = e.clientY - this.state.startY
    this.setState({ left, top })
  }

  handleDragEnd = () => {
    this.setState({ dragging: false })
    window.removeEventListener('mousemove', this.handleDragMove)
    window.removeEventListener('mouseup', this.handleDragEnd)
  }

  handleResizeStart = (e) => {
    e.preventDefault()
    this.setState({
      resizing: true,
      resizeStartX: e.clientX,
      resizeStartY: e.clientY,
      startWidth: this.state.width,
      startHeight: this.state.height
    })
    window.addEventListener('mousemove', this.handleResizeMove)
    window.addEventListener('mouseup', this.handleResizeEnd)
  }

  handleResizeMove = (e) => {
    if (!this.state.resizing) return
    const dx = e.clientX - this.state.resizeStartX
    const dy = e.clientY - this.state.resizeStartY
    const minW = 360, minH = 220
    const vw = (typeof window !== 'undefined') ? window.innerWidth : 1200
    const vh = (typeof window !== 'undefined') ? window.innerHeight : 800
    const maxW = Math.max(300, vw - this.state.left - 20)
    const maxH = Math.max(200, vh - this.state.top - 20)
    const width = Math.min(maxW, Math.max(minW, this.state.startWidth + dx))
    const height = Math.min(maxH, Math.max(minH, this.state.startHeight + dy))
    this.setState({ width, height })
  }

  handleResizeEnd = () => {
    this.setState({ resizing: false })
    window.removeEventListener('mousemove', this.handleResizeMove)
    window.removeEventListener('mouseup', this.handleResizeEnd)
  }

  popOutWindow = () => {
    if (typeof window === 'undefined') return
    const w = window.open('', 'bandstour_help', 'width=760,height=560,menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes')
    if (!w || w.closed) {
      // Popup likely blocked
      alert('Please allow pop-ups for this site to open the help window.')
      return
    }
    const style = `body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#37474F;color:#F2EFE9;}\nheader{background:rgba(69,90,100,1);padding:10px 14px;font-weight:bold;position:sticky;top:0;}\nmain{padding:14px 16px;line-height:1.6;font-size:15px;}\nh1{font-size:16px;margin:0;color:#F2EFE9}\nh2{font-size:14px;color:#aa8dc6;margin:14px 0 6px;}a,button{cursor:pointer}`
    const html = `<!doctype html>\n<html><head><meta charset="utf-8"><title>How to use Bandstour?</title><style>${style}</style></head><body>\n<header><h1>How to use Bandstour?</h1></header>\n<main>\n  <h2>SidePanels:</h2>\n  <p>Network and Map embed controls allow for finer tuning of the views than mouse controls, try it and you will see for yourself!.</p>\n  <p>The wheel allows different changes of configuration: Display/Hide legend, Charts, Network, Geo Map,Time. Map background allows changing Geo Map background. Network layout allows different network rendering. Node radius can be set depending on weight (as provided), or degree of connectivity. Settings Allow different modifications of the graph, including delete (BEWARE). Font Size and DB Settings are quick-and-dirty hacks that allow Network font restyling for optimal viewing and saving, Save Graph Nodes move to DB allows to force saving node moved to DB.</p>\n  <p>The Home button allows searching for Nodes (here venues).</p>\n  <h2>Main panels:</h2>\n  <p>Under Title, Datas shows calculated optimisation of tour. Title box also get selected nodes/edges chips. Clicking on them reveals their datas. When some are selected, Focu and rearrange redraws a subGraph, ordered, whereas focus only just removes the other nodes/edges from the view. On timeline, pressing Stop set timedelta to 1 year. Pressing next button iterates 1 year slices. Otherwise play/pause button can allow animation. Charts has console output stats too, so use the inspector to reveal various Stats if need be.</p>\n</main>\n</body></html>`
    try {
      w.document.open()
      w.document.write(html)
      w.document.close()
      w.focus()
    } catch (e) {
      // Fallback
    }
  }

  render() {
    const { topogram, nodesCount, edgesCount } = this.props
    return (
      <span>
        <CardTitle
          title={topogram.title}
          titleStyle={{ color: '#F2EFE9', fontSize: '16px', lineHeight: '1.25', padding: '2px 2px 10px 2px' }}
          subtitle={`${nodesCount} nodes, ${edgesCount} edges`}
          subtitleStyle={{ color: '#aa8dc6', fontSize: '13px', fontWeight: 'bold', lineHeight: '1.35' }}
        />

        <Divider />
        <CardText style={{ color: '#F2EFE9', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
          {topogram.description}

          <p style={{ color: '#F2EFE9', fontSize: '15px', lineHeight: '1.6' }}>Last modified {moment(topogram.lastModified).fromNow()}</p>
          <p style={{ color: '#F2EFE9', fontSize: '15px', lineHeight: '1.6' }}>Created {moment(topogram.createdAt).fromNow()}</p>
          <Divider />
          <br/>

          <p
            onClick={this.openHelp}
            style={{ color: '#aa8dc6', fontSize: '16px', fontWeight: 'bold', lineHeight: '1.35', cursor: 'pointer', textDecoration: 'underline' }}
          >
            <Tooltip title="Click to view help">
              <span>How to use Bandstour?</span>
            </Tooltip>
          </p>
        </CardText>

        {
          this.state.helpOpen ? (
            <Portal>
              <div
                style={{
                  position: 'fixed',
                  left: this.state.left,
                  top: this.state.top,
                  width: 640,
                  maxWidth: '92vw',
                  maxHeight: '80vh',
                  overflow: 'auto',
                  backgroundColor: 'rgba(69,90,100 ,0.95)',
                  color: '#F2EFE9',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
                  borderRadius: 6,
                  zIndex: 5000
                }}
              >
                <div
                  onMouseDown={this.handleDragStart}
                  style={{
                    cursor: 'move',
                    padding: '10px 14px',
                    fontWeight: 'bold',
                    background: 'rgba(69,90,100 ,1)',
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>How to use Bandstour?</span>
                  <span>
                    <Tooltip title="Pop out">
                      <button onClick={this.popOutWindow}
                        style={{ marginRight: 8, background:'transparent', color:'#F2EFE9', border:'1px solid #78909C', borderRadius:4, padding:'2px 6px' }}>
                        Pop out
                      </button>
                    </Tooltip>
                    <Tooltip title="Close">
                      <span style={{ cursor: 'pointer', fontSize: 18, opacity: 0.85 }} onClick={this.closeHelp}>✕</span>
                    </Tooltip>
                  </span>
                </div>
                <div style={{ padding: '14px 16px', lineHeight: '1.6', fontSize: 15 }}>
                  <p style={{ color: '#aa8dc6', fontSize: '14px', lineHeight: '1.5' }}>SidePanels:</p>
                  <p>
                    Network and Map embed controls allow for finer tuning of the views than mouse controls, try it and you will see for yourself!.
                  </p>
                  <p>
                    The wheel allows different changes of configuration: Display/Hide legend, Charts, Network, Geo Map,Time. Map background allows changing Geo Map background. Network layout allows different network rendering. Node radius can be set depending on weight (as provided), or degree of connectivity. Settings Allow different modifications of the graph, including delete (BEWARE). Font Size and DB Settings are quick-and-dirty hacks that allow Network font restyling for optimal viewing and saving, Save Graph Nodes move to DB allows to force saving node moved to DB.
                  </p>
                  <p>
                    The Home button allows searching for Nodes (here venues).
                  </p>
                  <p style={{ color: '#aa8dc6', fontSize: '14px', lineHeight: '1.5' }}>Main panels:</p>
                  <p>
                    Under Title, Datas shows calculated optimisation of tour. Title box also get selected nodes/edges chips. Clicking on them reveals their datas. When some are selected, Focu and rearrange redraws a subGraph, ordered, whereas focus only just removes the other nodes/edges from the view. On timeline, pressing Stop set timedelta to 1 year. Pressing next button iterates 1 year slices. Otherwise play/pause button can allow animation. Charts has console output stats too, so use the inspector to reveal various Stats if need be.
                  </p>
                </div>
                <Tooltip title="Resize">
                  <div
                    onMouseDown={this.handleResizeStart}
                    style={{
                      position: 'absolute',
                      width: 16,
                      height: 16,
                      right: 6,
                      bottom: 6,
                      cursor: 'nwse-resize',
                      borderRight: '2px solid #B0BEC5',
                      borderBottom: '2px solid #B0BEC5'
                    }}
                  />
                </Tooltip>
              </div>
            </Portal>
          ) : null
        }
      </span>
    )
  }
}

export default PanelDescription
