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
    const baseHref = (typeof document !== 'undefined' && document.baseURI) ? document.baseURI : (window.location.origin + '/')
    try {
      this.externalWindow.document.open()
      this.externalWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title || ''}</title><base href="${baseHref}"></head><body style="margin:0;background:#37474F;"><div id="__popup_root"></div></body></html>`)
      this.externalWindow.document.close()
    } catch (e) { /* ignore */ }
    // Copy styles after skeleton is ready
    copyStyles(document, this.externalWindow.document)

    this.containerEl = this.externalWindow.document.getElementById('__popup_root')

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
    try {
      ReactDOM.unstable_renderSubtreeIntoContainer(this, this.props.children, this.containerEl)
    } catch (e) {
      // If rendering fails (e.g., devtools sourcemap worker errors), no-op rather than crash
      // The window remains open; user can close it or retry.
    }
  }

  render() { return null }
}
