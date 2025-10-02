import { Meteor } from 'meteor/meteor'
import React from 'react'
import { render } from 'react-dom'

import { renderRoutes } from '/imports/startup/client/routes.jsx'

function renderWithCreateRootOrFallback(tree) {
  const container = document.getElementById('app')
  if (!container) return
  try {
    let client = null
    try {
      // Preferred export path (may fail on some Meteor setups)
      client = require('react-dom/client')
    } catch (e1) {
      try {
        // Direct file path fallback (exists in node_modules/react-dom)
        client = require('react-dom/client.js')
      } catch (e2) {
        // Avoid requiring react-dom internal CJS paths to prevent Meteor warnings
        client = null
      }
    }
    if (client && typeof client.createRoot === 'function') {
      if (!window.__TOPOROOT__) {
        window.__TOPOROOT__ = client.createRoot(container)
      }
      window.__TOPOROOT__.render(tree)
      return
    }
  } catch (err) {
    // swallow and fallback
  }
  // Fallback: legacy render (behaves like React 17)
  render(tree, container)
}

Meteor.startup(() => {
  // Opt-in StrictMode to surface legacy patterns during migration.
  // Enable by setting window.__REACT_STRICT_MODE__ = true (default: false)
  const enableStrict = (typeof window !== 'undefined') && window.__REACT_STRICT_MODE__ === true
  const tree = enableStrict
    ? (<React.StrictMode>{renderRoutes()}</React.StrictMode>)
    : renderRoutes()

  renderWithCreateRootOrFallback(tree)
})
