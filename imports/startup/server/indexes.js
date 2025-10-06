import { Meteor } from 'meteor/meteor'
import { Nodes, Edges, Topograms } from '/imports/api/collections.js'

Meteor.startup(() => {
  // Guard: only ensure once per process
  try {
    Nodes.rawCollection().createIndex({ topogramId: 1 }).catch(() => {})
    Nodes.rawCollection().createIndex({ 'data.id': 1 }, { unique: false }).catch(() => {})
    Edges.rawCollection().createIndex({ topogramId: 1 }).catch(() => {})
    Edges.rawCollection().createIndex({ 'data.id': 1 }, { unique: false }).catch(() => {})
    Topograms.rawCollection().createIndex({ sharedPublic: 1, createdAt: -1 }).catch(() => {})
    Topograms.rawCollection().createIndex({ title: 1, userId: 1 }, { unique: true, sparse: true }).catch(() => {})
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('[indexes] skipped or failed to ensure indexes', e && e.message)
  }
})
