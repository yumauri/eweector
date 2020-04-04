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
    createNode({
      from: event,
      seq: [compute(value => fn(currentState, value))],
      to: store,
    })
    return store
  }

  store.reset = event => store.on(event, () => defaultState)

  store.map = fn => {
    const mapped = createStore(fn(currentState))
    createNode({
      from: store,
      seq: [compute(fn)],
      to: mapped,
    })
    return mapped
  }

  store.kind = 'store'
  return store
}
