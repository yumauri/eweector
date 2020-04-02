const step = type => fn => ({
  type,
  fn,
})

export const compute = step('compute')
export const filter = step('filter')
