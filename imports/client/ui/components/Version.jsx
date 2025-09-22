import React from 'react'
import { Meteor } from 'meteor/meteor'

// Format semver (e.g., 0.3.0) into display like "V0.3"
function formatDisplay(version) {
  if (!version || typeof version !== 'string') return ''
  const parts = version.split('.')
  if (parts.length < 2) return `V${version}`
  const [major, minor] = parts
  return `V${major}.${minor}`
}

export default class Version extends React.Component {
  constructor(props) {
    super(props)
    this.state = { version: '' }
  }

  componentDidMount() {
    Meteor.call('getVersion', (err, data) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.warn('getVersion failed', err)
        return
      }
      this.setState({ version: data })
    })
  }

  render() {
    const display = formatDisplay(this.state.version)
    return (
      <p className="version" style={{ opacity: display ? 1 : 0.6 }}>
        {display || 'Version'}
      </p>
    )
  }
}
