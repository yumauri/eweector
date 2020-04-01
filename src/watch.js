import { createNode } from './createNode.js'

export const watch = unit => fn => {
  const node = createNode({
    seq: [fn],
  })
  unit.graphite.next.push(node)
}
