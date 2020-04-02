import { createNode } from './createNode.js'
import { compute } from './step.js'

export const watch = unit => fn => {
  const node = createNode({
    seq: [compute(fn)],
  })
  unit.graphite.next.push(node)
}
