import { createNode } from './createNode.js'
import { watch } from './watch.js'

export const createStore = defaultState => {
  let currentState = defaultState
  const store = {}

  store.graphite = createNode({
    seq: [value => (currentState = value)],
  })

  store.watch = fn => {
    fn(currentState)
    return watch(store)(fn)
  }

  store.on = (event, fn) => {
    const node = createNode({
      next: [store.graphite],
      seq: [value => fn(currentState, value)],
    })
    event.graphite.next.push(node)
    return store
  }

  store.reset = event => store.on(event, () => defaultState)

  return store
}
