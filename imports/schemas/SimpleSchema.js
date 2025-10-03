// Centralized SimpleSchema export with compatibility.
// Prefers npm 'simpl-schema'; falls back to Atmosphere 'meteor/aldeed:simple-schema'.
// This lets us migrate incrementally without touching call sites.

/* eslint-disable global-require */
let SimpleSchemaCompat
try {
	// Prefer Atmosphere package first to remain compatible with aldeed:collection2
	const meteorMod = require('meteor/aldeed:simple-schema')
	SimpleSchemaCompat = meteorMod.SimpleSchema
} catch (e1) {
	try {
		// Fallback to npm package when Atmosphere is not present
		const mod = require('simpl-schema')
		SimpleSchemaCompat = mod.default || mod
	} catch (e2) {
		throw new Error('SimpleSchema not available: tried meteor/aldeed:simple-schema and simpl-schema')
	}
}

export const SimpleSchema = SimpleSchemaCompat
export default SimpleSchemaCompat

// Polyfills for legacy expectations
// Some code relies on SimpleSchema.RegEx.Id (Meteor Random.id-style). Ensure it exists.
if (!SimpleSchemaCompat.RegEx) {
	SimpleSchemaCompat.RegEx = {}
}
if (!SimpleSchemaCompat.RegEx.Id) {
	// Meteor default _id is a 17-char Base58 string (Random.id)
	// See: https://docs.meteor.com/api/random.html#Random-id
	// This regex matches the common Random.id output
	SimpleSchemaCompat.RegEx.Id = /^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/
}
