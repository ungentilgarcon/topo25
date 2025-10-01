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
  render(tree, document.getElementById('app'), document.getElementById('react-c3js'))
})
