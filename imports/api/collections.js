import { Mongo } from 'meteor/mongo'
import { Meteor } from 'meteor/meteor'

import { Topograms } from '/imports/api/topograms/Topograms.js'
import { Nodes } from '/imports/api/nodes/Nodes.js'
import { Edges } from '/imports/api/edges/Edges.js'

export const Comments = new Mongo.Collection( 'comments' )

// Expose Users alias so legacy imports can reference it; Meteor maintains this collection.
export const Users = Meteor.users

export {
  Nodes,
  Edges,
  Topograms
}
