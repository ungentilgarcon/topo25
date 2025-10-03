// Centralized SimpleSchema export (npm simpl-schema only)
// We standardize on the npm package and keep a single import surface.
/* eslint-disable global-require */
let SimpleSchemaCompat
{
  const mod = require('simpl-schema')
  SimpleSchemaCompat = mod.default || mod
}

export const SimpleSchema = SimpleSchemaCompat
export default SimpleSchemaCompat

// Ensure RegEx.Id exists; npm simpl-schema provides it, but keep a fallback.
if (!SimpleSchemaCompat.RegEx) {
  SimpleSchemaCompat.RegEx = {}
}
if (!SimpleSchemaCompat.RegEx.Id) {
  SimpleSchemaCompat.RegEx.Id = /^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/
}
