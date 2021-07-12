import { test, expect } from '@jest/globals'
import Insulator from '@/models/insulator-model'
import signals from '@/globals'
import Bus from '@/models/bus-model'

const busOutput = new Bus()
const insulator = new Insulator(busOutput, signals.RIB1)

test('Constructor', () => {
    expect(insulator.value).toBe(0)
    insulator.value = 73
    expect(insulator.value).toBe(73)
    expect(busOutput.hasPower()).toBe(false)
    expect(busOutput.value).toBe(0)
})

test('Allow value transfer', () => {
    const s = {}
    s[signals.RIB1] = true
    insulator.update(1, s)
    expect(busOutput.hasPower()).toBe(true)
    expect(busOutput.value).toBe(73)
})
