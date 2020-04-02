import ninos from 'ninos'
import test from 'ava'
import { createStore, createEvent } from '../src/index.js'

const it = ninos(test)

it('#1: Counter should work as expected', t => {
  const log = t.context.stub()

  const add = createEvent()
  const sub = createEvent()
  const reset = createEvent()

  const counter = createStore(0)
    .on(add, (count, n) => count + n)
    .on(sub, (count, n) => count - n)
    .reset(reset)

  counter.watch(n => log('counter:', n))
  // counter: 0
  add.watch(n => log('add', n))
  sub.watch(n => log('subtract', n))
  reset.watch(() => log('reset counter'))

  add(5)
  // add 5
  // counter: 5
  sub(1)
  // subtract 1
  // counter: 4
  reset()
  // reset counter
  // counter: 0

  t.deepEqual(
    log.calls.map(c => c.arguments),
    [
      ['counter:', 0],
      ['add', 5],
      ['counter:', 5],
      ['subtract', 1],
      ['counter:', 4],
      ['reset counter'],
      ['counter:', 0],
    ]
  )
})
