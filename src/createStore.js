import { createNode } from './createNode.js'
import { compute } from './step.js'
import { watch } from './watch.js'

export const createStore = defaultState => {
  let currentState = defaultState
  const store = {}

  store.graphite = createNode({
    seq: [compute(value => (currentState = value))],
  })

  store.watch = fn => {
    fn(currentState)
    return watch(store)(fn)
  }

  store.on = (event, fn) => {
    const node = createNode({
      next: [store.graphite],
      seq: [compute(value => fn(currentState, value))],
    })
    event.graphite.next.push(node)
    return store
  }

  store.reset = event => store.on(event, () => defaultState)

  store.map = fn => {
    const mapped = createStore(fn(currentState))
    const node = createNode({
      next: [mapped.graphite],
      seq: [compute(fn)],
    })
    store.graphite.next.push(node)
    return mapped
  }

  return store
}
