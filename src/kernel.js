const queue = []

const exec = () => {
  cycle: while (queue.length) {
    let { node, value } = queue.shift()

    for (let i = 0; i < node.seq.length; i++) {
      const step = node.seq[i]
      switch (step.type) {
        case 'compute':
          value = step.fn(value)
          break
        case 'filter':
          if (!step.fn(value)) continue cycle
          break
      }
    }

    node.next.forEach(node => queue.push({ node, value }))
  }
}

export const launch = (unit, value) => {
  queue.push({ node: unit.graphite, value })
  exec()
}
