import { getGraph } from './getter.js'

const arrify = units =>
  [units]
    .flat()
    .filter(Boolean)
    .map(getGraph)

export const createNode = ({ from, seq = [], to } = {}) => {
  const node = {
    next: arrify(to),
    seq,
  }
  arrify(from).forEach(n => n.next.push(node))
  return node
}
