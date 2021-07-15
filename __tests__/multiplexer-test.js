import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import Multiplexer from '@/models/multiplexer-model'
import Clock from '@/models/clock'
import Debug, { Level } from '@/debug'

const inputBus = new Bus()
const inputBus2 = new Bus()
const valueBus = new Bus(1)
const outputBus = new Bus()
const mult = new Multiplexer([inputBus, inputBus2], outputBus, valueBus)

test('Output = input1', () => {
    inputBus.setValue(10)

    mult.update()

    expect(outputBus.getValue()).toBe(10n)
})

test('Output = input2', () => {
    inputBus2.setValue(12)
    valueBus.setValue(1)

    mult.update()

    expect(outputBus.getValue()).toBe(12n)
})

test('Output = input1 w/ Clock', () => {
    inputBus.setValue(15)
    valueBus.setValue(0)
    Clock.waitAndTick(2)
    expect(outputBus.getValue()).toBe(15n)
})

test('Too many input buses', () => {
    const size = Debug.getMessages(Level.CRIT).length
    const m = new Multiplexer([inputBus, inputBus2], outputBus, new Bus(0))
    expect(Debug.getMessages(Level.CRIT).length).toBe(size + 1)
    const size2 = Debug.getMessages(Level.WARN).length
    m.update()
    expect(Debug.getMessages(Level.WARN).length).toBe(size2 + 1)
})

test('Not enough input buses', () => {
    const size = Debug.getMessages(Level.WARN).length
    new Multiplexer([inputBus, inputBus2], outputBus, new Bus(2))
    expect(Debug.getMessages(Level.WARN).length).toBe(size + 1)
})
