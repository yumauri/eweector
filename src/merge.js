import { createEvent } from './createEvent.js'
import { forward } from './forward.js'

export const merge = (...events) => {
  const event = createEvent()
  forward({
    from: events.flat(),
    to: event,
  })
  return event
}
