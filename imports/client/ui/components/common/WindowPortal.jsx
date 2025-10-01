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
      this.externalWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title || ''}</title><base href="${baseHref}"></head><body style="margin:0;background:#37474F;color:#F2EFE9;font-family:sans-serif;"><div id="__popup_root" style="padding:10px">Loading…</div></body></html>`)
      this.externalWindow.document.close()
    } catch (e) { /* ignore */ }
    try { this.externalWindow.focus() } catch (e) {}
    // Defer initialization until the external window is ready
    const init = () => {
      try {
        // Copy styles after skeleton is ready
        copyStyles(document, this.externalWindow.document)
        this.containerEl = this.externalWindow.document.getElementById('__popup_root')
        this._renderSubtree()
      } catch (e) {
        // best effort
      }
    }

    // If document is already ready, init immediately; otherwise wait for load
    try {
      const ready = this.externalWindow.document && (this.externalWindow.document.readyState === 'interactive' || this.externalWindow.document.readyState === 'complete')
      if (ready) {
        init()
      } else {
        // Try multiple signals
        this.externalWindow.addEventListener('DOMContentLoaded', init, { once: true })
        this.externalWindow.addEventListener('load', init, { once: true })
        // Poll as a fallback to handle edge cases where events are missed
        let tries = 0
        this._ensureReadyInterval = setInterval(() => {
          tries += 1
          try {
            if (!this.externalWindow || this.externalWindow.closed) { clearInterval(this._ensureReadyInterval); return }
            const doc = this.externalWindow.document
            if (doc && doc.body) {
              clearInterval(this._ensureReadyInterval)
              init()
            }
          } catch (e) {
            clearInterval(this._ensureReadyInterval)
          }
          if (tries > 40) { // ~8s at 200ms
            clearInterval(this._ensureReadyInterval)
            init()
          }
        }, 200)
      }
    } catch (e) {
      // fallback
      setTimeout(init, 0)
    }

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
    if (this._ensureReadyInterval) { try { clearInterval(this._ensureReadyInterval) } catch (e) {} this._ensureReadyInterval = null }
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
      // Keep a friendly fallback visible for the user
      try {
        this.containerEl.innerHTML = '<div style="padding:10px;color:#F2EFE9">Failed to render content in this window. If you use a popup/script blocker, please allow this site and retry.</div>'
        // Also log in the opener console for diagnostics
        if (typeof window !== 'undefined' && window.console) {
          // eslint-disable-next-line no-console
          console.warn('WindowPortal render error:', e)
        }
      } catch (_) { /* ignore */ }
    }
  }

  render() { return null }
}
