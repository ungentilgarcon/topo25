import { STOP_SUBSCRIPTION } from 'meteor-redux-middlewares'

import {
  EDGES_SUBSCRIPTION_READY,
  EDGES_SUBSCRIPTION_CHANGED,
  EDGES_SUB,
} from '/imports/client/actions/edges'

const initialState = {
  ready: false,
  edges: [],
  edgesSubscriptionStopped: false,
}


export function edges(state = initialState, action) {
  switch (action.type) {
  case EDGES_SUBSCRIPTION_READY:
    return {
      ...state,
      ready: action.payload.ready,
      edgesSubscriptionStopped: false,
    }
  case EDGES_SUBSCRIPTION_CHANGED:
    // Convert from Minimongo Document to plain JS objects
    // to avoid passing non-serializable data to Cytoscape
    return {
      ...state,
      edges: action.payload.map(d => JSON.parse(JSON.stringify(d))),
    }
  case STOP_SUBSCRIPTION:
    return action.payload === EDGES_SUB
      ? { ...state, edgesSubscriptionStopped: true }
      : state
  default:
    return state
  }
}
