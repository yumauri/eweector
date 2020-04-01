const queue = []

const exec = () => {
  while (queue.length) {
    let { node, value } = queue.shift()
    node.seq.forEach(step => (value = step(value)))
    node.next.forEach(node => queue.push({ node, value }))
  }
}

export const launch = (unit, value) => {
  queue.push({ node: unit.graphite, value })
  exec()
}
