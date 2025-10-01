import React from 'react'
import ReactDOM from 'react-dom'

class Portal extends React.Component {
  componentDidMount() {
    if (typeof document === 'undefined') return
    this.container = document.createElement('div')
    document.body.appendChild(this.container)
    this._renderPortal()
  }
  componentDidUpdate() { this._renderPortal() }
  componentWillUnmount() {
    if (!this.container) return
    ReactDOM.unmountComponentAtNode(this.container)
    document.body.removeChild(this.container)
    this.container = null
  }
  _renderPortal() {
    if (!this.container) return
    ReactDOM.unstable_renderSubtreeIntoContainer(this, this.props.children, this.container)
  }
  render() { return null }
}

export default class Popup extends React.Component {
  constructor(props) {
    super(props)
    const width = props.width || 640
    const height = props.height || 420
    const vw = (typeof window !== 'undefined') ? window.innerWidth : 1200
    const vh = (typeof window !== 'undefined') ? window.innerHeight : 800
    const left = props.left != null ? props.left : Math.max(10, Math.round((vw - width) / 2))
    const top = props.top != null ? props.top : Math.max(10, Math.round((vh - height) / 2))
    this.state = {
      left, top, width, height,
      dragging: false, startX: 0, startY: 0,
      resizing: false, resizeStartX: 0, resizeStartY: 0, startWidth: width, startHeight: height
    }
  }

  componentWillUnmount() {
    this._teardownListeners()
  }

  _teardownListeners() {
    window.removeEventListener('mousemove', this.handleDragMove)
    window.removeEventListener('mouseup', this.handleDragEnd)
    window.removeEventListener('mousemove', this.handleResizeMove)
    window.removeEventListener('mouseup', this.handleResizeEnd)
  }

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
    const minW = this.props.minWidth || 360
    const minH = this.props.minHeight || 220
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

  renderHeader() {
    const { title, onClose } = this.props
    return (
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
          justifyContent: 'space-between',
          color: '#F2EFE9'
        }}
      >
        <span>{title}</span>
        <span style={{ cursor: 'pointer', fontSize: 18, opacity: 0.85 }} onClick={onClose} title="Close">✕</span>
      </div>
    )
  }

  render() {
    const { show, children, zIndex } = this.props
    if (!show) return null
    return (
      <Portal>
        <div
          style={{
            position: 'fixed',
            left: this.state.left,
            top: this.state.top,
            width: this.state.width,
            height: this.state.height,
            maxWidth: '92vw',
            maxHeight: '90vh',
            overflow: 'auto',
            backgroundColor: 'rgba(69,90,100 ,0.95)',
            color: '#F2EFE9',
            boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
            borderRadius: 6,
            zIndex: zIndex || 5000
          }}
        >
          {this.renderHeader()}
          <div style={{ padding: '12px 14px' }}>
            {children}
          </div>
          <div
            onMouseDown={this.handleResizeStart}
            title="Resize"
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
        </div>
      </Portal>
    )
  }
}
