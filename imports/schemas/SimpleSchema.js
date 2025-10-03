// Centralized SimpleSchema export with compatibility.
// Prefers npm 'simpl-schema'; falls back to Atmosphere 'meteor/aldeed:simple-schema'.
// This lets us migrate incrementally without touching call sites.

/* eslint-disable global-require */
let SimpleSchemaCompat
try {
	// Prefer npm package
	const mod = require('simpl-schema')
	SimpleSchemaCompat = mod.default || mod
} catch (e) {
	// Fallback to Atmosphere package
	const meteorMod = require('meteor/aldeed:simple-schema')
	SimpleSchemaCompat = meteorMod.SimpleSchema
}

export const SimpleSchema = SimpleSchemaCompat
export default SimpleSchemaCompat
