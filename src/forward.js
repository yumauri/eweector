import { createNode } from './createNode.js'

export const forward = ({ from, to }) => {
  createNode({
    from,
    to,
  })
}
