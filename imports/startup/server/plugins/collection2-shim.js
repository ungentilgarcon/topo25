// Minimal collection2-core-like shim using npm simpl-schema
// - Adds attachSchema/simpleSchema to Mongo.Collection
// - Validates and cleans on insert/update

import { Mongo } from 'meteor/mongo'

const proto = Mongo.Collection.prototype

if (!proto._c2ShimPatched) {
  const originalInsert = proto.insert
  const originalUpdate = proto.update
  const originalInsertAsync = proto.insertAsync
  const originalUpdateAsync = proto.updateAsync

  proto.attachSchema = function attachSchema(schema) {
    this._c2 = { schema }
    return this
  }

  proto.simpleSchema = function simpleSchema() {
    return (this._c2 && this._c2.schema) || null
  }

  function cleanAndValidate({ collection, docOrMod, isModifier }) {
    const schema = collection.simpleSchema()
    if (!schema) return
    schema.clean(docOrMod, { mutate: true, modifier: !!isModifier })
    schema.validate(docOrMod, { modifier: !!isModifier })
  }

  proto.insert = function patchedInsert(doc, ...rest) {
    cleanAndValidate({ collection: this, docOrMod: doc, isModifier: false })
    return originalInsert.call(this, doc, ...rest)
  }

  proto.update = function patchedUpdate(selector, modifier, ...rest) {
    cleanAndValidate({ collection: this, docOrMod: modifier, isModifier: true })
    return originalUpdate.call(this, selector, modifier, ...rest)
  }

  proto.insertAsync = async function patchedInsertAsync(doc, ...rest) {
    cleanAndValidate({ collection: this, docOrMod: doc, isModifier: false })
    return originalInsertAsync.call(this, doc, ...rest)
  }

  proto.updateAsync = async function patchedUpdateAsync(selector, modifier, ...rest) {
    cleanAndValidate({ collection: this, docOrMod: modifier, isModifier: true })
    return originalUpdateAsync.call(this, selector, modifier, ...rest)
  }

  proto._c2ShimPatched = true
}
