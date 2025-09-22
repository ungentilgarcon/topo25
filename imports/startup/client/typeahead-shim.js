// Registers corejs-typeahead on jQuery and exposes a minimal Meteor.typeahead wrapper (if needed).
// Loaded from client startup to keep behavior similar to the old sergeyt:typeahead package.

// Use Meteor's jQuery to avoid multiple jQuery instances
import { $ } from 'meteor/jquery'
// corejs-typeahead registers $.fn.typeahead when imported
import 'corejs-typeahead'

// Optional: Provide a minimal Meteor.typeahead wrapper used by some legacy templates.
// Our code search didn't find any use, but keeping this no-op wrapper avoids surprises
// if a hidden call site exists.
if (typeof Meteor !== 'undefined' && typeof Meteor.typeahead === 'undefined') {
  Meteor.typeahead = function (element, datasetOrOptions) {
    const $el = $(element)
    if (!$el || typeof $el.typeahead !== 'function') return null
    // If datasetOrOptions is provided, attempt to initialize, otherwise no-op
    try {
      if (datasetOrOptions) {
        // Accept either (options, dataset) or a single dataset per corejs-typeahead API
        if (Array.isArray(datasetOrOptions)) {
          return $el.typeahead.apply($el, datasetOrOptions)
        }
        return $el.typeahead(datasetOrOptions)
      }
      return $el
    } catch (e) {
      // Silently ignore to match legacy robustness
      // eslint-disable-next-line no-console
      console.warn('Meteor.typeahead shim error:', e)
      return null
    }
  }
}
