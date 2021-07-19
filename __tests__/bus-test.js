import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import { MAXIMUM_ALLOWED_BUS_POWER_TIME } from '@/globals'
import Debug, { Level } from '@/debug'

const bus = new Bus()

test('Constructor', () => {
    expect(bus.hasPower()).toBe(false)
    expect(bus.value).toBe(0n)
})

test('Set value', () => {
    bus.setValue(5)
    expect(bus.hasPower()).toBe(true)
    expect(bus.value).toBe(5n)
})

test('Update of MAXIMUM_ALLOWED_BUS_POWER_TIME', () => {
    bus.update(MAXIMUM_ALLOWED_BUS_POWER_TIME)
    expect(bus.hasPower()).toBe(true)
    expect(bus.value).toBe(5n)
})

test('Update of MAXIMUM_ALLOWED_BUS_POWER_TIME + 1', () => {
    bus.update(1)
    expect(bus.hasPower()).toBe(false)
    expect(bus.value).toBe(0n)
})

test('Number too high', () => {
    const bus2 = new Bus(2)
    const size = Debug.getMessages(Level.CRIT).length
    bus2.setValue(5)
    expect(Debug.getMessages(Level.CRIT).length).toBe(size + 1)
})

test('Put a string', () => {
    const sizeBefore = Debug.getMessages(Level.CRIT).length
    bus.setValue('Je suis une chaîne')
    expect(Debug.getMessages(Level.CRIT).length).toBe(sizeBefore + 1)
})
