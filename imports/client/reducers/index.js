import { combineReducers } from 'redux'
import { uiReducer } from '/imports/client/legacyUi'
import { topogramsPublic } from './topogramsPublic'
import { topogram } from './topogram'
import { topogramsPrivate } from './topogramsPrivate'
import { nodes } from './nodes'
import { edges } from './edges'
import { user } from './user'

const rootReducer = combineReducers({
  topogram,
  topogramsPrivate,
  topogramsPublic,
  nodes,
  edges,
  user,
  ui: uiReducer
})

export default rootReducer
