import ninos from 'ninos'
import test from 'ava'
import {
  createEvent,
  createStore,
  createApi,
  forward,
  restore,
  merge,
  split,
  is,
} from '../src/index.js'

const it = ninos(test)

it('#3: Forward should work as expected', t => {
  const log = t.context.stub()

  const event1 = createEvent()
  const event2 = createEvent()
  const event3 = createEvent()
  const event4 = createEvent()
  const event5 = createEvent()
  const event6 = createEvent()
  const event7 = createEvent()
  const event8 = createEvent()

  event1.watch(x => log('event1', x))
  event2.watch(x => log('event2', x))
  event3.watch(x => log('event3', x))
  event4.watch(x => log('event4', x))
  event5.watch(x => log('event5', x))
  event6.watch(x => log('event6', x))
  event7.watch(x => log('event7', x))
  event8.watch(x => log('event8', x))

  forward({ from: event1, to: event2 })
  forward({ from: [event3, event4], to: event5 })
  forward({ from: event6, to: [event7, event8] })

  event1(1)
  event3(3)
  event4(4)
  event6(6)

  t.deepEqual(
    log.calls.map(c => c.arguments),
    [
      ['event1', 1],
      ['event2', 1],

      ['event3', 3],
      ['event5', 3],

      ['event4', 4],
      ['event5', 4],

      ['event6', 6],
      ['event7', 6],
      ['event8', 6],
    ]
  )
})

it('#3: Merge should work as expected', t => {
  const log = t.context.stub()

  const event1 = createEvent()
  const event2 = createEvent()
  const event3 = createEvent()
  const event4 = createEvent()
  const event5 = createEvent()

  event1.watch(x => log('event1', x))
  event2.watch(x => log('event2', x))
  event3.watch(x => log('event3', x))
  event4.watch(x => log('event4', x))
  event5.watch(x => log('event5', x))

  const event12 = merge([event1, event2])
  const event345 = merge(event3, event4, event5)

  event12.watch(x => log('event12', x))
  event345.watch(x => log('event345', x))

  event1(1)
  event2(2)
  event3(3)
  event4(4)
  event5(5)

  t.deepEqual(
    log.calls.map(c => c.arguments),
    [
      ['event1', 1],
      ['event12', 1],

      ['event2', 2],
      ['event12', 2],

      ['event3', 3],
      ['event345', 3],

      ['event4', 4],
      ['event345', 4],

      ['event5', 5],
      ['event345', 5],
    ]
  )
})

it('#3: Split should work as expected', t => {
  const log = t.context.stub()

  const message = createEvent()

  const messageByAuthor = split(message, {
    bob: ({ user }) => user === 'bob',
    alice: ({ user }) => user === 'alice',
  })
  messageByAuthor.bob.watch(({ text }) => {
    log('[bob]:', text)
  })
  messageByAuthor.alice.watch(({ text }) => {
    log('[alice]:', text)
  })

  message({ user: 'bob', text: 'Hello' })
  // [bob]: Hello
  message({ user: 'alice', text: 'Hi bob' })
  // [alice]: Hi bob

  /* default case, triggered if no one condition met */
  const { __: guest } = messageByAuthor
  guest.watch(({ text }) => {
    log('[guest]:', text)
  })
  message({ user: 'unregistered', text: 'hi' })
  // [guest]: hi

  t.deepEqual(
    log.calls.map(c => c.arguments),
    [
      ['[bob]:', 'Hello'],
      ['[alice]:', 'Hi bob'],
      ['[guest]:', 'hi'],
    ]
  )
})

it('#3: CreateApi should work as expected', t => {
  const log = t.context.stub()

  const playerPosition = createStore(0)

  // create events and attach them to store
  const api = createApi(playerPosition, {
    moveLeft: (pos, n) => pos - n,
    moveRight: (pos, n) => pos + n,
  })

  playerPosition.watch(pos => log('position', pos))
  // position 0

  api.moveRight(10)
  // position 10
  api.moveLeft(5)
  // position 5

  t.deepEqual(
    log.calls.map(c => c.arguments),
    [
      ['position', 0],
      ['position', 10],
      ['position', 5],
    ]
  )
})

it('#3: Is should work as expected', t => {
  const store = createStore(null)
  const event = createEvent()

  t.true(is.store(store))
  t.false(is.store(event))
  t.false(is.store(null))

  t.true(is.event(event))
  t.false(is.event(store))
  t.false(is.event(null))

  t.true(is.unit(event))
  t.true(is.unit(store))
  t.false(is.event(null))
})

it('#3: Restore should work as expected', t => {
  const log = t.context.stub()

  const store0 = createStore(null)
  t.is(restore(store0), store0)

  const event = createEvent()
  const store = restore(event, 'default')

  store.watch(state => log('state:', state))
  // state: default

  event('foo')
  // state: foo

  const { foo, bar } = restore({
    foo: 'foo',
    bar: 0,
  })
  foo.watch(foo => log('foo', foo))
  // foo 'foo'
  bar.watch(bar => log('bar', bar))
  // bar 0

  t.deepEqual(
    log.calls.map(c => c.arguments),
    [
      ['state:', 'default'],
      ['state:', 'foo'],
      ['foo', 'foo'],
      ['bar', 0],
    ]
  )
})
