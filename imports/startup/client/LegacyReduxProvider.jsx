import React from 'react'
import PropTypes from 'prop-types'

// Provides legacy Redux context keys expected by older HOCs (e.g., redux-ui or
// older react-redux connect) so they can coexist with react-redux 7 Provider.
export default class LegacyReduxProvider extends React.Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
    children: PropTypes.node,
  }

  getChildContext() {
    return { store: this.props.store }
  }

  render() {
    return this.props.children || null
  }
}

LegacyReduxProvider.childContextTypes = {
  store: PropTypes.object,
}
