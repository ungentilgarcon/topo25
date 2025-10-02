/* eslint-disable prefer-arrow-callback */
import { Meteor } from 'meteor/meteor'
import { Topograms } from '../../collections.js'

/*
 *  MULTIPLE TOPOGRAMS
 */
// only the topogams that have been publicized
Meteor.publish( 'topograms.private', function topogramsPrivate() {
  if (!this.userId) { return this.ready() }
  return Topograms.find({ 'userId': this.userId })
} )

Meteor.publish('topograms.public', function topogramsPublic() {
  const self = this
  ;(async () => {
    try {
      // Support both legacy numeric 1 and boolean true values for sharedPublic
      const cursor = Topograms.find({ sharedPublic: { $in: [true, 1] } }, { sort: { createdAt: -1 } })
      const list = await cursor.fetchAsync()
      for (const t of list) {
        let author = {}
        if (t.userId) {
          const u = await Meteor.users.findOneAsync({ _id: t.userId }, { fields: { username: 1, createdAt: 1 } })
          if (u) author = { username: u.username, createdAt: u.createdAt }
        }
        const { _id, ...fields } = t
        // Never include _id inside fields for self.added
        self.added('topograms', _id, { ...fields, author })
      }
      self.ready()
    } catch (e) {
      try { self.ready() } catch (e2) { /* noop */ }
    }
  })()
})

/*
 *  SINGLE TOPOGRAM
 */
Meteor.publish( 'topogram', function ( topogramId ) {
  // TODO : prevent subscribing to private topogram
  return Topograms.find({ '_id': topogramId })
})
