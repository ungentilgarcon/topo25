import { Tracker } from 'meteor/tracker'
import { applyMiddleware, createStore, compose } from 'redux'
import createReactiveMiddlewares from 'meteor-redux-middlewares'
import thunkImport, { thunk as namedThunk } from 'redux-thunk'

import rootReducer from '/imports/client/reducers'

const { sources, subscriptions } = createReactiveMiddlewares(Tracker)

// Resolve redux-thunk export shape across versions/module systems
const resolvedThunk = (typeof namedThunk === 'function')
  ? namedThunk
  : (typeof thunkImport === 'function'
      ? thunkImport
      : (thunkImport && typeof thunkImport.default === 'function' ? thunkImport.default : null))

// Only keep valid middleware functions
const middlewares = [sources, subscriptions, resolvedThunk].filter((mw) => typeof mw === 'function')

// Prefer Redux DevTools compose if available
const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__)
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
  : compose

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(...middlewares))
)

export default store
