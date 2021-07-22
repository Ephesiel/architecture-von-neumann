import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import { NB_BITS_ARCH, MAXIMUM_ALLOWED_BUS_POWER_TIME } from '@/globals'
import Debug, { Level } from '@/debug'
import { UNSIGNED, int, uint } from '@/integer'

const bus = new Bus('Test')

test('Constructor', () => {
    expect(bus.hasPower()).toBe(false)
    expect(bus.value.toNumber()).toBe(0)
})

test('Update of MAXIMUM_ALLOWED_BUS_POWER_TIME', () => {
    bus.setValue(int(5))
    bus.update(MAXIMUM_ALLOWED_BUS_POWER_TIME)
    expect(bus.hasPower()).toBe(true)
    expect(bus.value.toNumber()).toBe(5)
})

test('Update of MAXIMUM_ALLOWED_BUS_POWER_TIME + 1', () => {
    bus.setValue(int(5))
    bus.update(MAXIMUM_ALLOWED_BUS_POWER_TIME + 1)
    expect(bus.hasPower()).toBe(false)
    expect(bus.value.toNumber()).toBe(0)
})

test('Set value 1 (Success)', () => {
    bus.setValue(int(5))
    expect(bus.hasPower()).toBe(true)
    expect(bus.value.toNumber()).toBe(5)
})

test('Set value 2 (Error : not an integer)', () => {
    const size = Debug.getMessages(Level.CRIT).length
    bus.setValue('random string')
    expect(Debug.getMessages(Level.CRIT).length).toBe(size + 1)
    bus.setValue(1)
    expect(Debug.getMessages(Level.CRIT).length).toBe(size + 2)
    bus.setValue(-1n)
    expect(Debug.getMessages(Level.CRIT).length).toBe(size + 3)
})

test('Set value 3 (testing signed / unsigned)', () => {
    const size = Debug.getMessages(Level.CRIT).length
    bus.setValue(int(-5))
    bus.setValue(uint(5))
    expect(Debug.getMessages(Level.CRIT).length).toBe(size)

    const anotherBus = new Bus('Another bus', NB_BITS_ARCH, UNSIGNED)
    anotherBus.setValue(uint(5))
    anotherBus.setValue(int(5))
    expect(Debug.getMessages(Level.CRIT).length).toBe(size)
    anotherBus.setValue(int(-5))
    expect(Debug.getMessages(Level.CRIT).length).toBe(size + 1)
})

test('Set value 4 (superior size, but right value)', () => {
    bus.setValue(int(12, NB_BITS_ARCH * 2))
    expect(bus.getValue().toNumber()).toBe(12)
    expect(bus.getValue().getSize()).toBe(NB_BITS_ARCH)
})

test('Set value 5 (inferior size, but right value)', () => {
    bus.setValue(int(4, NB_BITS_ARCH / 2))
    expect(bus.getValue().toNumber()).toBe(4)
    expect(bus.getValue().getSize()).toBe(NB_BITS_ARCH)
})

test('Number too high', () => {
    const bus2 = new Bus('2', 2, UNSIGNED)
    const size = Debug.getMessages(Level.CRIT).length
    bus2.setValue(uint(5))
    expect(Debug.getMessages(Level.CRIT).length).toBe(size + 1)
})

test('Update remembers the sign and size', () => {
    const anotherBus = new Bus('another bus', 16, UNSIGNED)
    anotherBus.update(10)
    expect(anotherBus.getValue().getSize()).toBe(16)
    expect(anotherBus.getValue().signed).toBe(UNSIGNED)
})
