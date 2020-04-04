import { createNode } from './createNode.js'
import { compute } from './step.js'

export const watch = unit => fn => {
  createNode({
    from: unit,
    seq: [compute(fn)],
  })
}
