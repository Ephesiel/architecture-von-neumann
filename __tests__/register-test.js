import { test, expect } from '@jest/globals'
import Signals from '@/globals'
import Bus from '@/models/bus-model'
import Register from '@/models/registers/register-model'
import Helper from '@/helper'

const busInput1 = new Bus()
const busInput2 = new Bus()
const busOutput1 = new Bus()
const busOutput2 = new Bus()
const register = new Register(
    [
        Helper.makeRObj(busInput1, Signals.eRA),
        Helper.makeRObj(busInput2, Signals.eRB),
    ],
    [busOutput1, busOutput2]
)

test('Exception', () => {
    expect(() => {
        register.update(1, {})
    }).toThrow()
})

test('Output values', () => {
    register.currentValue = 1
    register.setOutputValue()
    for (const bus of register.outputs) {
        expect(bus.value).toBe(1)
    }
})

test('Input one bus', () => {
    busInput1.setValue(1)
    busInput2.setValue(2)

    register.tryValueUpdate(busInput1, Signals.eRA, false, {
        [Signals.eRA]: true,
    })
    expect(register.nextValue).toBe(1)
    register.tryValueUpdate(busInput2, Signals.eRB, false, {
        [Signals.eRB]: true,
    })
    expect(register.nextValue).toBe(2)
})

test('Exception, 2', () => {
    busInput1.setValue(1)
    busInput2.setValue(2)

    expect(() => {
        register.tryValueUpdate(busInput1, Signals.eRA, true, {
            [Signals.eRA]: true,
        })
    }).toThrow()
    expect(() => {
        register.tryValueUpdate(busInput2, Signals.eRB, true, {
            [Signals.eRB]: true,
        })
    }).toThrow()
})
