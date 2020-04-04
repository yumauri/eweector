import { createEvent } from './createEvent.js'

export const createApi = (store, setters) => {
  const result = {}

  for (const key in setters) {
    const fn = setters[key]
    result[key] = createEvent()
    store.on(result[key], fn)
  }

  return result
}
