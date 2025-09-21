import { Meteor } from 'meteor/meteor'
import { Nodes, Edges, Topograms, Comments } from '/imports/api/collections.js'

// Map string names to concrete collections to avoid relying on
// dburles:mongo-collection-instances (Mongo.Collection.get)
const COLLECTIONS_BY_NAME = {
  nodes: Nodes,
  edges: Edges,
  topograms: Topograms,
  comments: Comments,
  users: Meteor.users
}

Meteor.methods({
  /**
  * Update a specific field based on an _id and a collection name
  */
  updateField(collection, _id, field, value) {
    if (collection && _id && field && value) {
      const Collection = COLLECTIONS_BY_NAME[String(collection).toLowerCase()]
      if (!Collection) return
      const toUpdate = {}
      toUpdate[field] = value
      Collection.update({ _id }, { $set: toUpdate })
    }
  }
})
