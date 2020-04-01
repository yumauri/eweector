import { createStore, createEvent } from '../src/index.js'

const add = createEvent()
const sub = createEvent()
const reset = createEvent()

const counter = createStore(0)
  .on(add, (count, n) => count + n)
  .on(sub, (count, n) => count - n)
  .reset(reset)

counter.watch(n => console.log('counter:', n))
// counter: 0
add.watch(n => console.log('add', n))
sub.watch(n => console.log('subtract', n))
reset.watch(() => console.log('reset counter'))

add(5)
// add 5
// counter: 5
sub(1)
// subtract 1
// counter: 4
reset()
// reset counter
// counter: 0
