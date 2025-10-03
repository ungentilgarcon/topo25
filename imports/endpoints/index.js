import { Meteor } from 'meteor/meteor'
import { Accounts } from 'meteor/accounts-base'

// Feature flags
// - UPGRADE_PROBE: skip API wiring and expose only a minimal health endpoint
//   JSON API is enabled by default when not in probe mode; no USE_JSONROUTES env is required.
const upgradeProbe = (typeof process !== 'undefined' && process.env && process.env.UPGRADE_PROBE === '1')

// In upgrade-probe mode, define only a tiny health route using WebApp and bail out
if (upgradeProbe) {
  try {
    // eslint-disable-next-line global-require
    const { WebApp } = require('meteor/webapp')
    WebApp.connectHandlers.use('/api', (req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ message: 'API works (upgrade probe minimal mode)' }))
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Upgrade probe health route failed to initialize:', e && e.message)
  }
  // Skip loading any additional API wiring in upgrade-probe mode
}

// Lightweight diagnostics for login events to help with end-to-end verification
if (Meteor.isServer) {
  Accounts.onLogin((info) => {
    try {
      const u = info && info.user
      const email = (u && u.emails && u.emails[0] && u.emails[0].address) || u && u.username || 'unknown'
      // eslint-disable-next-line no-console
      console.log('[accounts] login', { userId: info.user && info.user._id, email })
    } catch (e) {
      // noop
    }
  })
}

// If not in probe mode, set up the native WebApp JSON API
if (!upgradeProbe) {
  try {
    // eslint-disable-next-line global-require
    const { setupJsonApi } = require('/imports/endpoints/api-jsonroutes.js')
    setupJsonApi()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to initialize JSON API:', e && e.message)
  }
}

// Export a null Api for compatibility (legacy imports may expect a symbol)
export const Api = null
