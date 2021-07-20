import { test, expect } from '@jest/globals'
import { Signals } from '@/globals'
import Bus from '@/models/bus-model'
import Register from '@/models/registers/register-model'
import Helper from '@/helper'
import Debug, { Level } from '@/debug'

const busInput1 = new Bus()
const busInput2 = new Bus()
const busOutput1 = new Bus()
const busOutput2 = new Bus()
const register = new Register(
    'test',
    [
        Helper.makeRObj(busInput1, Signals.eRA),
        Helper.makeRObj(busInput2, Signals.eRB),
    ],
    [busOutput1, busOutput2],
    Signals.eRC
)

test('Output values', () => {
    register.currentValue = 1n
    register.setOutputValue()
    for (const bus of register.getOutputs()) {
        expect(bus.value).toBe(1n)
    }
})

test('Input one bus', () => {
    busInput1.setValue(1n)
    busInput2.setValue(2n)

    register.tryValueUpdate(busInput1, Signals.eRA, false, {
        [Signals.eRA]: true,
    })
    expect(register.nextValue).toBe(1n)
    register.tryValueUpdate(busInput2, Signals.eRB, false, {
        [Signals.eRB]: true,
    })
    expect(register.nextValue).toBe(2n)
})

test('Exception, 2', () => {
    busInput1.setValue(1n)
    busInput2.setValue(2n)

    const size = Debug.getMessages(Level.ERROR).length
    register.tryValueUpdate(busInput1, Signals.eRA, true, {
        [Signals.eRA]: true,
    })
    expect(Debug.getMessages(Level.ERROR).length).toBe(size + 1)
    const size2 = Debug.getMessages(Level.ERROR).length
    register.tryValueUpdate(busInput2, Signals.eRB, true, {
        [Signals.eRB]: true,
    })
    expect(Debug.getMessages(Level.ERROR).length).toBe(size2 + 1)
})
