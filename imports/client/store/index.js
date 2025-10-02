import { Tracker } from 'meteor/tracker'
import { applyMiddleware, createStore, compose } from 'redux'
import createReactiveMiddlewares from 'meteor-redux-middlewares'
import thunk from 'redux-thunk'

import rootReducer from '/imports/client/reducers'

const {
  sources,
  subscriptions,
} = createReactiveMiddlewares(Tracker)

const middlewares = [ sources, subscriptions, thunk ]

const store = createStore(rootReducer, compose(
  applyMiddleware(...middlewares),
  window.devToolsExtension ? window.devToolsExtension() : f => f
))

export default store
