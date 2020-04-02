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
    const node = createNode({
      next: [mapped.graphite],
      seq: [compute(fn)],
    })
    event.graphite.next.push(node)
    return mapped
  }

  event.prepend = fn => {
    const prepended = createEvent()
    const node = createNode({
      next: [event.graphite],
      seq: [compute(fn)],
    })
    prepended.graphite.next.push(node)
    return prepended
  }

  event.filter = fn => {
    const filtered = createEvent()
    const node = createNode({
      next: [filtered.graphite],
      seq: [filter(fn)],
    })
    event.graphite.next.push(node)
    return filtered
  }

  event.filterMap = fn => {
    const filtered = createEvent()
    const node = createNode({
      next: [filtered.graphite],
      seq: [compute(fn), filter(value => value !== undefined)],
    })
    event.graphite.next.push(node)
    return filtered
  }

  return event
}
