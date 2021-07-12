import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import { MAXIMUM_ALLOWED_BUS_POWER_TIME } from '@/globals'

const bus = new Bus()

test('Constructor', () => {
    expect(bus.hasPower()).toBe(false)
    expect(bus.value).toBe(0)
})

test('Set value', () => {
    bus.setValue(5)
    expect(bus.hasPower()).toBe(true)
    expect(bus.value).toBe(5)
})

test('Update of MAXIMUM_ALLOWED_BUS_POWER_TIME', () => {
    bus.update(MAXIMUM_ALLOWED_BUS_POWER_TIME)
    expect(bus.hasPower()).toBe(true)
    expect(bus.value).toBe(5)
})

test('Update of MAXIMUM_ALLOWED_BUS_POWER_TIME + 1', () => {
    bus.update(1)
    expect(bus.hasPower()).toBe(false)
    expect(bus.value).toBe(0)
})
