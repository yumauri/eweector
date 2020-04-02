import ninos from 'ninos'
import test from 'ava'
import { createStore, createEvent } from '../src/index.js'

const it = ninos(test)

it('#2: Maps should work as expected', t => {
  const log = t.context.stub()

  const number = createEvent()
  const abs = number.map(x => Math.abs(x))

  const numbers = createStore([]) //
    .on(abs, (array, x) => array.concat([x]))
  const sum = numbers.map(array => array.reduce((x, y) => x + y, 0))

  numbers.watch(array => log('numbers:', array))
  // numbers: []
  sum.watch(array => log('sum:', array))
  // sum: 0
  number.watch(x => log('number', x))
  abs.watch(x => log('abs', x))

  number(5)
  // number 5
  // abs 5
  // numbers: [5]
  // sum: 5

  number(-3)
  // number -3
  // abs 3
  // numbers: [5, 3]
  // sum: 8

  t.deepEqual(
    log.calls.map(c => c.arguments),
    [
      ['numbers:', []],
      ['sum:', 0],
      ['number', 5],
      ['abs', 5],
      ['numbers:', [5]],
      ['sum:', 5],
      ['number', -3],
      ['abs', 3],
      ['numbers:', [5, 3]],
      ['sum:', 8],
    ]
  )
})

it('#2: Prepend should work as expected', t => {
  const log = t.context.stub()

  const number = createEvent()
  const to = number.prepend(x => Number(x))

  number.watch(x => log('number', x))
  to.watch(x => log('to', x))

  to(5)
  // to 5
  // number 5

  to('23')
  // to '23'
  // number 23

  t.deepEqual(
    log.calls.map(c => c.arguments),
    [
      ['to', 5],
      ['number', 5],
      ['to', '23'],
      ['number', 23],
    ]
  )
})

it('#2: Filter should work as expected', t => {
  const log = t.context.stub()

  const number = createEvent()
  const digit = number.filter(x => x >= 0 && x < 10)

  const digits = createStore([]) //
    .on(digit, (array, x) => array.concat([x]))

  digits.watch(array => log('digits:', array))
  // digits: []
  number.watch(x => log('number', x))
  digit.watch(x => log('digit', x))

  number(5)
  // number 5
  // digit 5
  // digits: [5]

  number(13)
  // number 13

  number(123)
  // number 123

  number(3)
  // number 3
  // digit 3
  // digits: [5, 3]

  t.deepEqual(
    log.calls.map(c => c.arguments),
    [
      ['digits:', []],
      ['number', 5],
      ['digit', 5],
      ['digits:', [5]],
      ['number', 13],
      ['number', 123],
      ['number', 3],
      ['digit', 3],
      ['digits:', [5, 3]],
    ]
  )
})

it('#2: FilterMap should work as expected', t => {
  const log = t.context.stub()

  const number = createEvent()
  const digit10 = number.filterMap(x => (x >= 0 && x < 10 ? x * 10 : undefined))

  number.watch(x => log('number', x))
  digit10.watch(x => log('digit10', x))

  number(5)
  // number 5
  // digit10 50

  number(13)
  // number 13

  number(123)
  // number 123

  number(3)
  // number 3
  // digit10 30

  t.deepEqual(
    log.calls.map(c => c.arguments),
    [
      ['number', 5],
      ['digit10', 50],
      ['number', 13],
      ['number', 123],
      ['number', 3],
      ['digit10', 30],
    ]
  )
})
