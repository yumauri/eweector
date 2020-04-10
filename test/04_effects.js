import ninos from 'ninos'
import test from 'ava'
import {
  createEffect,
  createEvent,
  createStore,
  forward,
} from '../src/index.js'

const it = ninos(test)
const sleep = n => new Promise(resolve => setTimeout(resolve, n))

it('#4: Effects should work as expected', async t => {
  const log = t.context.stub()

  const nplus = createEffect({
    async handler(n) {
      return new Promise(resolve => setTimeout(() => resolve(n + 1), 1))
    },
  })

  const numbers = createStore([]).on(nplus.doneData, (a, n) => [...a, n])

  numbers.watch(_ => log('numbers', _))
  nplus.watch(_ => log('nplus', _))
  nplus.finally.watch(_ => log('nplus.finally', _))
  nplus.done.watch(_ => log('nplus.done', _))
  nplus.doneData.watch(_ => log('nplus.doneData', _))
  nplus.fail.watch(_ => log('nplus.fail', _))
  nplus.failData.watch(_ => log('nplus.failData', _))

  nplus(1)
  await sleep(2)

  nplus.use(n => new Promise(resolve => setTimeout(() => resolve(n + 2), 1)))

  nplus(2)
  await sleep(2)

  nplus.use(
    n => new Promise((resolve, reject) => setTimeout(() => reject(n + 3), 1))
  )

  nplus(3)
  await sleep(2)

  nplus.use(n => n + 4)

  nplus(4)
  await sleep(2)

  nplus.use(n => {
    throw n + 5
  })

  nplus(5)
  await sleep(2)

  t.deepEqual(
    log.calls.map(c => c.arguments),
    [
      ['numbers', []],
      ['nplus', 1],
      ['nplus.finally', { status: 'done', params: 1, result: 2 }],
      ['nplus.done', { params: 1, result: 2 }],
      ['nplus.doneData', 2],
      ['numbers', [2]],

      ['nplus', 2],
      ['nplus.finally', { status: 'done', params: 2, result: 4 }],
      ['nplus.done', { params: 2, result: 4 }],
      ['nplus.doneData', 4],
      ['numbers', [2, 4]],

      ['nplus', 3],
      ['nplus.finally', { status: 'fail', params: 3, error: 6 }],
      ['nplus.fail', { params: 3, error: 6 }],
      ['nplus.failData', 6],

      ['nplus', 4],
      ['nplus.finally', { status: 'done', params: 4, result: 8 }],
      ['nplus.done', { params: 4, result: 8 }],
      ['nplus.doneData', 8],
      ['numbers', [2, 4, 8]],

      ['nplus', 5],
      ['nplus.finally', { status: 'fail', params: 5, error: 10 }],
      ['nplus.fail', { params: 5, error: 10 }],
      ['nplus.failData', 10],
    ]
  )
})

it('#4: Effects stores pending and inFlight should work', async t => {
  const log = t.context.stub()

  const fx = createEffect({
    async handler(n) {
      return new Promise(resolve => setTimeout(() => resolve(n), n))
    },
  })

  fx.watch(_ => log('fx', _))
  fx.pending.watch(_ => log('fx.pending', _))
  fx.inFlight.watch(_ => log('fx.inFlight', _))
  fx.finally.watch(_ => log('fx.finally', _))
  fx.done.watch(_ => log('fx.done', _))
  fx.doneData.watch(_ => log('fx.doneData', _))
  fx.fail.watch(_ => log('fx.fail', _))
  fx.failData.watch(_ => log('fx.failData', _))

  fx(11)
  fx(22)
  await sleep(30)

  t.deepEqual(
    log.calls.map(c => c.arguments),
    [
      ['fx.pending', false],
      ['fx.inFlight', 0],

      ['fx', 11],
      ['fx.inFlight', 1],
      ['fx.pending', true],

      ['fx', 22],
      ['fx.inFlight', 2],
      ['fx.pending', true], // TODO: fix later

      ['fx.finally', { status: 'done', params: 11, result: 11 }],
      ['fx.done', { params: 11, result: 11 }],
      ['fx.inFlight', 1],
      ['fx.doneData', 11],
      ['fx.pending', true], // TODO: fix later

      ['fx.finally', { status: 'done', params: 22, result: 22 }],
      ['fx.done', { params: 22, result: 22 }],
      ['fx.inFlight', 0],
      ['fx.doneData', 22],
      ['fx.pending', false],
    ]
  )
})

it('#4: Effects should work with forward', async t => {
  const log = t.context.stub()

  const event = createEvent()
  const fx = createEffect({
    async handler(n) {
      return new Promise(resolve => setTimeout(() => resolve(n * n), 1))
    },
  })
  forward({ from: event, to: fx })

  event.watch(_ => log('event', _))
  fx.watch(_ => log('fx', _))
  fx.done.watch(_ => log('fx.done', _))

  event(5)
  await sleep(10)

  t.deepEqual(
    log.calls.map(c => c.arguments),
    [
      ['event', 5],
      ['fx', 5],
      ['fx.done', { params: 5, result: 25 }],
    ]
  )
})

it('#4: Effects should return Promise', async t => {
  const fx = createEffect({
    async handler(n) {
      return new Promise(resolve => setTimeout(() => resolve(n), 1))
    },
  })

  const promise = fx(42)
  t.true(promise instanceof Promise)

  const result = await promise
  t.is(result, 42)
})
