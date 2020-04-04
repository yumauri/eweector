import { createStore } from './createStore.js'
import * as is from './is.js'

export const restore = (unit, defaultState) => {
  if (is.store(unit)) {
    return unit
  }

  if (is.event(unit)) {
    return createStore(defaultState).on(unit, (_, x) => x)
  }

  const result = {}
  for (const key in unit) {
    result[key] = createStore(unit[key])
  }
  return result
}
