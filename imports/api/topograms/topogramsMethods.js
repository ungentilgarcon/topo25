import { slugify } from '../../helpers'
import { Topograms, Nodes } from '../collections.js'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { SimpleSchema } from '/imports/schemas/SimpleSchema'

import { buildErrorAnswer } from '/imports/api/responses'

const TOPOGRAM_ID_ONLY = new SimpleSchema({
  topogramId: Topograms.simpleSchema().schema('_id'),
}).validator({ clean: true, filter: false })

const TOPOGRAM_ID_AND_TITLE = new SimpleSchema({
  topogramId: Topograms.simpleSchema().schema('_id'),
  title: Topograms.simpleSchema().schema('title'),
}).validator({ clean: true, filter: false })

/**
* Create a topogram
*
* @instance {ValidatedMethod}
* @param {String} title the title of the new topogram
* @return {Object} the Topogram object as inserted in Mongo
*/
export const topogramCreate = new ValidatedMethod({
  name: 'topogram.create',
  validate: new SimpleSchema({
    title: Topograms.simpleSchema().schema('title'),
    userId: Topograms.simpleSchema().schema('userId')
  }).validator({ clean: true, filter: false }),
  async run({ title, userId=this.userId }) {

    // forbid with the same name
    const t = await Topograms.findOneAsync({ title, userId })
    if (t && t._id) {
      return buildErrorAnswer({
        'message' : 'A topogram with the same name already exists',
        'data' : t
      })
    }

    const sharedPublic = !userId ? true : false

    return await Topograms.insertAsync({
      title,
      'slug': slugify( title ),
      'createdAt': new Date(), // current time
      sharedPublic,
      userId // _id of logged in user
    })
  }
})

/**
* Delete a topogram. Will also delete all edges and nodes with this topogramId
*
* @param {String} _id the Mongo _id of the topogram to delete
* @return {Object} the Topogram object as inserted in Mongo
*/
export const topogramDelete = new ValidatedMethod({
  name: 'topogram.delete',
  validate: TOPOGRAM_ID_ONLY,
  async run({ topogramId }) {
    await Nodes.removeAsync({ topogramId }) // delete all connected nodes
    // Meteor.call( 'deleteNodesByTopogramId', topogramId )
    // Meteor.call( 'deleteEdgesByTopogramId', topogramId )
    return await Topograms.removeAsync(topogramId)
  }
})

/**
* Edit the title of a topogram
*
* @instance {ValidatedMethod}
* @param {String} _id the Mongo _id of the topogram to update
* @param {String} title the new title of the topogram
* @param {String} description the description of the topogram
* @return {Object} the Topogram object as inserted in Mongo
*/

export const topogramUpdate = new ValidatedMethod({
  name: 'topogram.update',
  validate: new SimpleSchema({
      topogramId: Topograms.simpleSchema().schema('_id'),
      title: Topograms.simpleSchema().schema('title'),
      description: Topograms.simpleSchema().schema('description')
    })
    .validator({ clean: true, filter: false }),
  async run({ topogramId, title, description }) {
    return await Topograms.updateAsync( topogramId,
      { '$set' : {
        'title': title,
        'description': description,
        'slug': slugify( title )
      },
        'updatedAt' : new Date()
      }
    )
  }
})


/**
* Edit the title of a topogram
*
* @instance {ValidatedMethod}
* @param {String} _id the Mongo _id of the topogram to update
* @param {String} title the new title of the topogram
* @return {Object} the Topogram object as inserted in Mongo
*/
export const topogramUpdateTitle = new ValidatedMethod({
  name: 'topogram.updateTitle',
  validate: TOPOGRAM_ID_AND_TITLE,
  async run({ topogramId, title }) {
    return await Topograms.updateAsync( topogramId,
      { '$set' : { 'title' : title, 'slug': slugify( title ) },
        'updatedAt' : new Date()
      }
    )
  }
})

/**
* Make a topograms public
*
* @param {String} topogramId the Mongo _id of the new topogram
* @return {Object} the Topogram object as inserted in Mongo
*/

export const topogramTogglePublic = new ValidatedMethod({
  name: 'topogram.togglePublic',
  validate: TOPOGRAM_ID_ONLY,
  async run({ topogramId }) {
    const t = await Topograms.findOneAsync(topogramId, { fields: { sharedPublic : 1 } })
    const sharedPublic= (t && t.sharedPublic) || false 
    return await Topograms.updateAsync( topogramId,
      { '$set' : { 'sharedPublic' : !sharedPublic },
        'updatedAt' : new Date()
      }
    )
  }
})


/**
* Make a topograms private
*
* @param {String} _id the Mongo _id of the new topogram
* @return {Object} the Topogram object as updated in Mongo
*/
/*
makePrivate( _id ) {
  return Topograms.update( _id, {
    $set: {
      'sharedPublic': false
    }
  } )
}
*/


/**
* Search topograms by title or beginning of title.
* Useful to build an autocomplete or a search of the indexed documents
*
* @param {String} query the (partial) name of the new topogram
* @param {Object} options options for the Mongo query
* @return {Object} the Topogram object as inserted in Mongo
*/
/*
search( query, options ) {
  options = options || {}

      // guard against client-side DOS: hard limit to 50
  if ( options.limit ) {
    options.limit = Math.min( 50, Math.abs( options.limit ) )
  }
  else {
    options.limit = 50
  }

      // TODO fix regexp to support multiple tokens
  const regex = new RegExp( '^' + query )
  return Topograms.find( {
    'owner': Meteor.userId,
    slug: {
      $regex: regex
    }
  }, options ).fetch()
}
*/
