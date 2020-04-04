const not = fn => value => !fn(value)

export const split = (event, cases) => {
  const result = {}

  for (const key in cases) {
    const fn = cases[key]
    result[key] = event.filter(fn)
    event = event.filter(not(fn))
  }

  result.__ = event
  return result
}
