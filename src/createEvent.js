import { createNode } from './createNode.js'
import { compute, filter } from './step.js'
import { launch } from './kernel.js'
import { watch } from './watch.js'

export const createEvent = () => {
  const event = payload => launch(event, payload)
  event.graphite = createNode()
  event.watch = watch(event)

  event.map = fn => {
    const mapped = createEvent()
    createNode({
      from: event,
      seq: [compute(fn)],
      to: mapped,
    })
    return mapped
  }

  event.prepend = fn => {
    const prepended = createEvent()
    createNode({
      from: prepended,
      seq: [compute(fn)],
      to: event,
    })
    return prepended
  }

  event.filter = fn => {
    const filtered = createEvent()
    createNode({
      from: event,
      seq: [filter(fn)],
      to: filtered,
    })
    return filtered
  }

  event.filterMap = fn => {
    const filtered = createEvent()
    createNode({
      from: event,
      seq: [compute(fn), filter(value => value !== undefined)],
      to: filtered,
    })
    return filtered
  }

  event.kind = 'event'
  return event
}
