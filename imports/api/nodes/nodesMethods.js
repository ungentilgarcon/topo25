import { Nodes, Edges } from '../collections.js'
import { Meteor } from 'meteor/meteor'
import { bulkCollectionUpdate } from '../../lib/bulkCollectionUpdate.js'

import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from '/imports/schemas/SimpleSchema'

// import logger from '../../logger.js'

// const NODE_ID_ONLY = new SimpleSchema({
//   nodeId: Nodes.simpleSchema().schema('_id'),
// }).validator({ clean: true, filter: false })

/**
* Create a single node
*
* @instance {ValidatedMethod}
* @param {Object} node the raw node data
* @return {Object} the Node object as inserted in Mongo
*/
export const nodeCreate = new ValidatedMethod({
  name: 'node.create',
  validate: Nodes.simpleSchema()
    .pick([
      'topogramId',
      'data.id',
      'data.name',
      'data.color',
      'data.group',
      'data.notes',
      'data.lat',
      'data.lng',
      'data.start',
      'data.end',
      'data.starred',
      'data.weight',
      'position.x',
      'position.y'
    ])
    .validator(),
  async run(node) {
    return await Nodes.insertAsync( node )
  }
})


/**
* Create multiple nodes at once
*
* @instance {ValidatedMethod}
* @param {Array} nodes an array of node data
* @return {Object} the Node object as inserted in Mongo
*/

const nodeSchema = Nodes.schema.pick([
  'data.id',
  'data.name',
  'data.color',
  'data.group',
  'data.notes',
  'data.lat',
  'data.lng',
  'data.start',
  'data.end',
  'data.starred',
  'data.weight',
  'position.x',
  'position.y'
])

export const nodeCreateMany = new ValidatedMethod({
  name: 'node.createMany',
  validate: new SimpleSchema({
    'topogramId': { type: String },
    'nodes' : { type : [ nodeSchema ], minCount: 1 }
  }).validator(),
  async run({ topogramId, nodes }) {
    // TODO : use validated "batchInsert'
    const ids = []
    for (const n of nodes) {
      // call as method for validation but await execution
      // Using direct insertAsync to avoid nested method context
      // Preserve original behavior: create one-by-one
      // eslint-disable-next-line no-await-in-loop
      const id = await Nodes.insertAsync({ ...n, topogramId })
      ids.push(id)
    }
    return ids

    // return Nodes.batchInsert( ok )
  }
})

/**
* Delete all nodes in a Topogram
*
* @instance {ValidatedMethod}
* @param {String} topogramId the _id of the topogram
* @return {Object} the Node object as removed from Mongo
*/
export const nodeDeleteAll = new ValidatedMethod({
  name: 'node.deleteAll',
  validate: new SimpleSchema({ 'topogramId': { type: String } }).validator(), // TODO :check if ID exists,
  async run( topogramId ) {
    return await Nodes.removeAsync(topogramId)
  }
})


/**
* Delete a single node
*
* @instance {ValidatedMethod}
* @param {String} nodeId _id of the node to be deleted
* @return {Object} the Node object as inserted in Mongo
*/

export const nodeDelete = new ValidatedMethod({
  name: 'node.delete',
  validate: new SimpleSchema({
    nodeId: { type: String }
  }).validator(), // TODO :check if ID exists,
  async run({ nodeId }) {
    return await Nodes.removeAsync( nodeId )
  }
})

/**
* Delete multiple nodes
*
* @instance {ValidatedMethod}
* @param {Array} nodesId list of node _ids deleted
* @return {Object} the Node object as inserted in Mongo
*/

export const nodeDeleteMany = new ValidatedMethod({
  name: 'node.deleteMany',
  validate: new SimpleSchema({
    nodeIds: { type: [String], minCount: 1 }
  }).validator(), // TODO :check if ID exists,
  async run({ nodeIds }) {
    return await Nodes.removeAsync( { '_id' : { $in : nodeIds } } )
  }
})

/**
* Update node properties
*
* @instance {ValidatedMethod}
* @param {String} nodeId _id of the node to be updated
* @param {Object} position the new position { x : 0, y, 0} of the node
* @return {Object} the updated Node object as returned by Mongo
*/


const nodeUpdateSchema = Nodes.schema.pick([
  'data.name',
  'data.color',
  'data.group',
  'data.notes',
  'data.lat',
  'data.lng',
  'data.start',
  'data.end',
  'data.starred',
  'data.weight'
])

export const nodeUpdate = new ValidatedMethod({
  name: 'node.update',
  validate: new SimpleSchema([
    nodeUpdateSchema,
    { 'nodeId': { type: String } }
  ]).validator(), // TODO :check if ID exists,
  async run( { nodeId, data }) {
    const $set = {}
    Object.keys(data).map( d=> $set['data.'+d] = data[d])
    return await Nodes.updateAsync({ 'data.id': nodeId }, { $set })
  }
})

/**
* Update node position
*
* @instance {ValidatedMethod}
* @param {String} nodeId _id of the node to be updated
* @param {Object} data the new position { x : 0, y, 0} of the node
* @return {Object} the updated Node object as returned by Mongo
*/
export const nodeMove = new ValidatedMethod({
  name: 'node.move',
  validate: new SimpleSchema({
    'topogramId': { type: String },
    'nodeId'    : { type: String },
    'position.x': { type: Number },
    'position.y': { type: Number }
  }).validator(), // TODO :check if ID exists,
  async run({ topogramId, nodeId, position }) {
    return await Nodes.updateAsync({ 'topogramId': topogramId,'data.id': nodeId }, { $set: { position } })
  }
})

Meteor.methods( {

  async mergeNodes( sourceId, targetId ) {
    const source = await Nodes.findOneAsync({ '_id': sourceId })
    const target = await Nodes.findOneAsync({ '_id': targetId })  // will be deleted

    // tx.start( "merges nodes" )

    // find and replace all target node edges with source id
    {
      const toSource = await Edges.find({ 'data.source': target.data.id }).fetchAsync()
      for (const edge of toSource) {
        // eslint-disable-next-line no-await-in-loop
        await Edges.updateAsync({ '_id': edge._id }, { $set: { 'data.source': source.data.id } })
      }
    }

    {
      const toTarget = await Edges.find({ 'data.target': target.data.id }).fetchAsync()
      for (const edge of toTarget) {
        // eslint-disable-next-line no-await-in-loop
        await Edges.updateAsync({ '_id': edge._id }, { $set: { 'data.target': source.data.id } })
      }
    }

    // copy data of target into source (if missing)
    // TODO : node merger startegy

    //erase target
  await Nodes.removeAsync({ '_id': targetId })
    // , {
    //     tx: true
    // } )
    // tx.commit()
  },

  async deleteNodeAndConnectedEdges( nodeId, edgesId ) {
    const nodeDoc = await Nodes.findOneAsync({ 'data.id': nodeId }, { fields: { _id: 1 } })
    const _id = nodeDoc && nodeDoc._id

    // tx.start( "delete node+neighborhood" )
    await Nodes.removeAsync({ _id })
    const toRemove = await Edges.find({ 'data.id': { '$in': edgesId } }).fetchAsync()
    for (const edge of toRemove) {
      // eslint-disable-next-line no-await-in-loop
      await Edges.removeAsync({ '_id': edge._id })
    }
    // tx.commit()
  },

  async deleteNodesByTopogramId( topogramId ) {
    return await Nodes.removeAsync({ topogramId })
  },

  //update coord in DB for a single node
  async updateNodePosition( nodeId, position ) {
    const node = await Nodes.findOneAsync({ 'data.id': nodeId })
    if (!node) return 0
    return await Nodes.updateAsync({ _id: node._id }, { $set: { position } })
  },


  // TODO : improve batch update of nodes
  // update coords in DB for bunch of nodes (useful to save topogram layout changes)
  async updateNodesPositions( updatedNodes ) {

    const nodesPosition = {}
    updatedNodes.forEach(function (d) {
      nodesPosition[d._id] = d.position
      return d
    })

    const nodes = (await Nodes.find({
      '_id' : {
        '$in': updatedNodes.map(function (d) {return d._id})
      }
    }).fetchAsync()).map(function (d) { // update data
      d.position = nodesPosition[d._id]
      return d
      //  = updatedNodes
    })

    await bulkCollectionUpdate(Nodes, nodes, {
      primaryKey : '_id',
      callback() {
        // logger.log('Nodes positions updated.')
      }
    })
  },

  async lockNode( nodeId, position ) {
    const node = await Nodes.findOneAsync({ 'data.id': nodeId })
    if (!node) return 0
    const locked = node.locked ? false : true
    return await Nodes.updateAsync({ _id: node._id }, { $set: { locked, position } })
  },

  // TODO: pass _id instead of data.id
  async starNode( nodeId ) {
    const node = await Nodes.findOneAsync({ 'data.id': nodeId })
    if (!node) return 0
    const starred = node.data && node.data.starred ? false : true
    return await Nodes.updateAsync({ _id: node._id }, { $set: { 'data.starred': starred } })

  },

  fetchNodes( edges ) {
    return edges.map( function ( e ) {
      return {
        source: e.data.source,
        target: e.data.target
      }
    })
      .reduce( function ( map, d ) {
        map[ d.id ] = map[ d.id ] || d
        map[ d.id ].count = ( map[ d.id ].count || 0 ) + 1
        return map
      }, {} )
  }
} )
