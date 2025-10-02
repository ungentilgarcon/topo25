import { Meteor } from 'meteor/meteor'
import React from 'react'
import { render } from 'react-dom'

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
  // Use legacy render under React 18 for Meteor compatibility; upgrade to createRoot once resolver supports 'react-dom/client'
  render(tree, container)
})
