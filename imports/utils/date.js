// Date utilities seam to replace moment incrementally.
// Today, proxy to moment; later, switch to dayjs/date-fns without touching call sites.

import moment from 'moment'

export function fromNow(d) {
  return moment(d).fromNow()
}

export function format(d, fmt) {
  return moment(d).format(fmt)
}

export function year(d) {
  return moment(d).year()
}

export function add(d, amount, unit) {
  return moment(d).add(amount, unit)
}

export default {
  fromNow,
  format,
  year,
  add,
}
