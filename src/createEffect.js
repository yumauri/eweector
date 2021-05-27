import { createNode } from './createNode.js'
import { createEvent } from './createEvent.js'
import { createStore } from './createStore.js'
import { compute } from './step.js'
import { launch } from './kernel.js'
import { watch } from './watch.js'
import { defer } from './defer.js'

const status =
  name =>
  ({ status, ...rest }) =>
    status === name ? rest : undefined

const field = name => object => object[name]

function Payload(params, resolve, reject) {
  this.params = params
  this.resolve = resolve
  this.reject = reject
}

const onDone = (event, params, resolve) => result => {
  launch(event, { status: 'done', params, result })
  resolve(result)
}

const onFail = (event, params, reject) => error => {
  launch(event, { status: 'fail', params, error })
  reject(error)
}

export const createEffect = ({ handler }) => {
  const effect = payload => {
    const deferred = defer()
    launch(effect, new Payload(payload, deferred.resolve, deferred.reject))
    return deferred.promise
  }

  effect.graphite = createNode()
  effect.watch = watch(effect)

  effect.prepend = fn => {
    const prepended = createEvent()
    createNode({
      from: prepended,
      seq: [compute(fn)],
      to: effect,
    })
    return prepended
  }

  effect.use = fn => (handler = fn)
  effect.use.getCurrent = () => handler

  const anyway = createEvent()
  const done = anyway.filterMap(status('done'))
  const fail = anyway.filterMap(status('fail'))
  const doneData = done.map(field('result'))
  const failData = fail.map(field('error'))

  effect.finally = anyway
  effect.done = done
  effect.fail = fail
  effect.doneData = doneData
  effect.failData = failData

  effect.inFlight = createStore(0)
    .on(effect, x => x + 1)
    .on(anyway, x => x - 1)
  effect.pending = effect.inFlight.map(amount => amount > 0)

  effect.graphite.seq.push(
    compute(data =>
      data instanceof Payload
        ? data // we get this data directly
        : new Payload( // we get this data indirectly through graph
            data,
            () => {}, // dumb resolve function
            () => {} // dumb reject function
          )
    ),
    compute(({ params, resolve, reject }) => {
      const handleDone = onDone(anyway, params, resolve)
      const handleFail = onFail(anyway, params, reject)
      try {
        const promise = handler(params)
        if (promise instanceof Promise) {
          promise.then(handleDone).catch(handleFail)
        } else {
          handleDone(promise)
        }
      } catch (error) {
        handleFail(error)
      }
      return params
    })
  )

  effect.kind = 'effect'
  return effect
}
