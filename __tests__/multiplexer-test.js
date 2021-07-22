import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import Multiplexer from '@/models/multiplexer-model'
import Clock from '@/models/clock'
import Debug, { Level } from '@/debug'
import { UNSIGNED, int } from '@/integer'

const inputBus = new Bus()
const inputBus2 = new Bus()
const valueBus = new Bus('Bus valeur', 1, UNSIGNED)
const outputBus = new Bus()
const mult = new Multiplexer([inputBus, inputBus2], outputBus, valueBus)

test('Output = input1', () => {
    inputBus.setValue(int(10))

    mult.update()

    expect(outputBus.getValue().toNumber()).toBe(10)
})

test('Output = input2', () => {
    inputBus2.setValue(int(12))
    valueBus.setValue(int(1))

    mult.update()

    expect(outputBus.getValue().toNumber()).toBe(12)
})

test('Output = input1 w/ Clock', () => {
    inputBus.setValue(int(15))
    valueBus.setValue(int(0))
    Clock.waitAndTick(int(2))
    expect(outputBus.getValue().toNumber()).toBe(15)
})

test('Too many input buses', () => {
    const size = Debug.getMessages(Level.CRIT).length
    const m = new Multiplexer(
        [inputBus, inputBus2, outputBus],
        outputBus,
        new Bus('test', 1, UNSIGNED)
    )
    expect(Debug.getMessages(Level.CRIT).length).toBe(size + 1)
    const size2 = Debug.getMessages(Level.WARN).length
    m.update()
    expect(Debug.getMessages(Level.WARN).length).toBe(size2 + 1)
})

test('Not enough input buses', () => {
    const size = Debug.getMessages(Level.WARN).length
    new Multiplexer(
        [inputBus, inputBus2],
        outputBus,
        new Bus('test2', 4, UNSIGNED)
    )
    expect(Debug.getMessages(Level.WARN).length).toBe(size + 1)
})
