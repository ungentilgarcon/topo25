// Wire up @aldeed/collection2-core for Meteor collections
import { Mongo } from 'meteor/mongo'
import { attach as attachCollection2 } from '@aldeed/collection2-core'

// Attach collection2-core to Meteor's Mongo.Collection prototype
// so that attachSchema, simpleSchema, etc., are available.
attachCollection2(Mongo.Collection)

// No exports; running this file sets up the integration
