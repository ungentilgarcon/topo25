import { Meteor } from 'meteor/meteor'
import React from 'react'
import { createRoot } from 'react-dom/client'

import { renderRoutes } from '/imports/startup/client/routes.jsx'

Meteor.startup(() => {
  // Opt-in StrictMode to surface legacy patterns during migration.
  // Enable by setting window.__REACT_STRICT_MODE__ = true (default: false)
  const enableStrict = (typeof window !== 'undefined') && window.__REACT_STRICT_MODE__ === true
  const tree = enableStrict
    ? (<React.StrictMode>{renderRoutes()}</React.StrictMode>)
    : renderRoutes()

  const container = document.getElementById('app')
  if (!container) return

  // Cache the root on window to avoid recreating it across hot reloads (Meteor HMR)
  if (!window.__TOPOROOT__) {
    window.__TOPOROOT__ = createRoot(container)
  }
  window.__TOPOROOT__.render(tree)
})
