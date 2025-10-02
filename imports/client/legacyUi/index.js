import React from 'react'
import { connect } from 'react-redux'

// Action types
const UI_MERGE = 'ui/merge'
const UI_SET = 'ui/set'
const UI_INIT = 'ui/init'

// Reducer: a simple flat UI state bag compatible with existing usage
export function uiReducer(state = {}, action) {
  switch (action.type) {
    case UI_MERGE: {
      const payload = action.payload || {}
      return { ...state, ...payload }
    }
    case UI_SET: {
      const { key, value } = action
      if (typeof key !== 'string') return state
      return { ...state, [key]: value }
    }
    case UI_INIT: {
      const init = action.payload || {}
      // Only set defaults for keys that are currently undefined
      const next = { ...state }
      Object.keys(init).forEach((k) => {
        if (typeof next[k] === 'undefined') next[k] = init[k]
      })
      return next
    }
    default:
      return state
  }
}

// HOC decorator compatible with `@ui({ state: {...} })`
// - Injects props.ui (from state.ui) and props.updateUI
// - Applies optional default state once on mount
export default function ui(options = {}) {
  return function wrap(WrappedComponent) {
    class UICompat extends React.Component {
      componentDidMount() {
        if (options && options.state) {
          this.props.__initUI(options.state)
        }
      }
      render() {
        return <WrappedComponent {...this.props} />
      }
    }

    const mapState = (state) => ({ ui: state.ui || {} })

    const mapDispatch = (dispatch) => ({
      updateUI: (arg1, arg2) => {
        // Supports updateUI({ a: 1 }) and updateUI('a', 1)
        if (arg1 && typeof arg1 === 'object') {
          dispatch({ type: UI_MERGE, payload: arg1 })
        } else if (typeof arg1 === 'string') {
          dispatch({ type: UI_SET, key: arg1, value: arg2 })
        }
      },
      __initUI: (defaultsObj) => dispatch({ type: UI_INIT, payload: defaultsObj || {} }),
    })

    return connect(mapState, mapDispatch)(UICompat)
  }
}
