import { createNode } from './createNode.js'
import { launch } from './kernel.js'
import { watch } from './watch.js'

export const createEvent = () => {
  const event = payload => launch(event, payload)
  event.graphite = createNode()
  event.watch = watch(event)
  return event
}
