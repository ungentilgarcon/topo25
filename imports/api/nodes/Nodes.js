import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Topograms } from '../topograms/Topograms.js'
import { Meteor } from 'meteor/meteor'

class NodesCollection extends Mongo.Collection {

}

export const Nodes = new NodesCollection('nodes')

// Deny all client-side updates since we will be using methods to manage this collection
Nodes.deny({
  insert() { return true },
  update() { return true },
  remove() { return true }
})

Nodes.schema = new SimpleSchema({
  topogramId: { type: String }
})

Nodes.attachSchema(Nodes.schema)

Nodes.helpers({
  topogram() {
    // In Meteor 3, server-side sync findOne is disallowed. Helpers can run
    // on both client and server; avoid server DB calls here. Publications or
    // call sites should fetch/link as needed on the server.
    if (Meteor.isServer) return null
    return Topograms.findOne(this.topogramId)
  }
})
