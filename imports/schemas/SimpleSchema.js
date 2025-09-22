// Centralized SimpleSchema export.
// Today: re-export from Atmosphere package 'meteor/aldeed:simple-schema'.
// Future: flip this file to import from 'simpl-schema' (npm) without changing call sites.
//   Example future change:
//     import SimpleSchema from 'simpl-schema'
//     export { SimpleSchema }
//     export default SimpleSchema

import { SimpleSchema } from 'meteor/aldeed:simple-schema'

export { SimpleSchema }
export default SimpleSchema
