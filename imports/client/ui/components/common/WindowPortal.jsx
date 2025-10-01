import React from 'react'
import ReactDOM from 'react-dom'

function copyStyles(sourceDoc, targetDoc) {
  try {
    const nodes = sourceDoc.querySelectorAll('style, link[rel="stylesheet"]')
    nodes.forEach((node) => {
      const clone = node.cloneNode(true)
      targetDoc.head.appendChild(clone)
    })
  } catch (e) {
    // best effort; ignore cross-origin or other failures
  }
}

export default class WindowPortal extends React.Component {
  componentDidMount() {
    if (typeof window === 'undefined') return
    const { title, features } = this.props
    this.externalWindow = window.open('', this.props.name || '', features || 'width=800,height=600,resizable=yes,scrollbars=yes')
    if (!this.externalWindow || this.externalWindow.closed) return
    this.externalWindow.document.title = title || ''
    copyStyles(document, this.externalWindow.document)

    this.containerEl = this.externalWindow.document.createElement('div')
    this.containerEl.style.margin = '0'
    this.containerEl.style.padding = '0'
    this.externalWindow.document.body.style.margin = '0'
    this.externalWindow.document.body.style.background = '#37474F'
    this.externalWindow.document.body.appendChild(this.containerEl)

    this._renderSubtree()
    this.externalWindow.addEventListener('beforeunload', this.handleExternalClose)
  }

  componentDidUpdate() { this._renderSubtree() }

  componentWillUnmount() {
    this._teardown()
  }

  handleExternalClose = () => {
    if (this.props.onClose) this.props.onClose()
    this._teardown()
  }

  _teardown() {
    if (this.containerEl) {
      try { ReactDOM.unmountComponentAtNode(this.containerEl) } catch (e) {}
    }
    if (this.externalWindow) {
      try { this.externalWindow.removeEventListener('beforeunload', this.handleExternalClose) } catch (e) {}
      try { this.externalWindow.close() } catch (e) {}
    }
    this.containerEl = null
    this.externalWindow = null
  }

  _renderSubtree() {
    if (!this.containerEl) return
    ReactDOM.unstable_renderSubtreeIntoContainer(this, this.props.children, this.containerEl)
  }

  render() { return null }
}
