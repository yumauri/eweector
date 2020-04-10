export const defer = () => {
  const deferred = {}

  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve
    deferred.reject = reject
  })

  // we need this to avoid 'unhandled exception' warning
  deferred.promise.catch(() => {})

  return deferred
}
