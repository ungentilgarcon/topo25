import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from '/imports/schemas/SimpleSchema'
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
  topogramId : {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    label : 'The ID of the topogram the node belongs to'
  },
  data: {
    type: Object,
    optional : true
  },
  'data.id': {
    type: String,
    label : 'id used by cytoscape',
    autoValue() {
      return this.isInsert && !this.value ?  'node-' + Math.round( Math.random() * 1000000 ) : this.value
    }
  },
  'data.name': {
    type: String,
    label: 'a name for the node',
    optional : true
  },
  'data.starred' : {
    type : Boolean,
    label : 'check is the node if starred',
    optional : true
  },
  'data.start' : {
    type : Date,
    label : 'Date when the node started existing',
    optional : true
  },
  'data.end' : {
    type : Date,
    label : 'Date when the node stopped existing',
    optional : true
  },
  'data.lat' : {
    type : Number,
    label : 'latitude',
    optional : true
  },
  'data.lng' : {
    type : Number,
    label : 'longitude',
    optional : true
  },
  'data.weight' : {
    type : Number,
    label : 'Weight of the node in the graph',
    optional : true
  },
  'data.color' : {
    type : String,
    label : 'Color associated to the node',
    optional : true
  },
  'data.group' : {
    type : String,
    label : 'Types or groups of the node',
    optional : true
  },
  'data.notes' : {
    type : String,
    label : 'A Mardkdown-formatted text to store some more info about the node',
    optional : true
  },
  group : {
    type: String,
    defaultValue : 'nodes'
  },
  position: {
    type: Object,
    optional: true
  },
  'position.x' :  {
    type : Number,
    autoValue() {
      return (this.isInsert && ! this.value) ? Math.floor(Math.random() * 300) : this.value
    },
    
  },
  'position.y' : {
    type : Number,
    autoValue() {
      return (this.isInsert && ! this.value) ? Math.floor(Math.random() * 300) : this.value
    },
    
  },
  owner: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },
  updatedAt: {
    type: Date,
    label: 'Last time the node was updated',
    autoValue() { return new Date() }
  },
  createdAt: {
    type: Date,
    label: 'Time when the node was created',
    autoValue() {
      return this.isInsert ? new Date() : this.value 
    }
  }
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
