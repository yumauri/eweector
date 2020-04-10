// prettier-ignore
const is = type => any =>
  (any !== null) &&
  (typeof any === 'function' || typeof any === 'object') &&
  ('kind' in any) &&
  (type === undefined || any.kind === type)

export const unit = is()
export const event = is('event')
export const store = is('store')
export const effect = is('effect')
