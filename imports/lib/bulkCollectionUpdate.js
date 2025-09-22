import { Meteor } from 'meteor/meteor'

/**
 * Minimal replacement for udondan:bulk-collection-update without fibers.
 * - On server: uses rawCollection().bulkWrite for efficient batched updates.
 * - On client (stubs): falls back to per-doc Collection.update.
 * Only sets provided fields (defaults to setting `position` when present).
 */
export async function bulkCollectionUpdate(Collection, docs, { primaryKey = '_id', callback } = {}) {
  if (!Array.isArray(docs) || docs.length === 0) {
    if (typeof callback === 'function') callback()
    return 0
  }

  const buildUpdate = (doc) => {
    if (Object.prototype.hasOwnProperty.call(doc, 'position')) {
      return { $set: { position: doc.position } }
    }
    // Generic: set all top-level keys except primaryKey
    const $set = { ...doc }
    delete $set[primaryKey]
    return { $set }
  }

  if (Meteor.isServer && typeof Collection.rawCollection === 'function') {
    const raw = Collection.rawCollection()
    const ops = docs.map((d) => ({
      updateOne: {
        filter: { [primaryKey]: d[primaryKey] },
        update: buildUpdate(d),
      },
    }))
    const res = await raw.bulkWrite(ops, { ordered: false })
    if (typeof callback === 'function') callback()
    return res
  }

  // Client-side/minimongo fallback
  docs.forEach((d) => {
    const selector = { [primaryKey]: d[primaryKey] }
    const modifier = buildUpdate(d)
    Collection.update(selector, modifier)
  })
  if (typeof callback === 'function') callback()
  return docs.length
}
