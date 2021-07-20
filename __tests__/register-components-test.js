import { test, expect } from '@jest/globals'
import { Signals } from '@/globals'
import Bus from '@/models/bus-model'
import Register from '@/models/registers/register-model'
import Helper from '@/helper'
import ClassicComponent from '@/models/registers/classic-component'
import InsulatorComponent from '@/models/registers/insulator-component'
import Insulator from '@/models/insulator-model'
import SignalManager from '@/models/signal-manager'
import Clock from '@/models/clock'

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
    []
)

test('T = T + 1 (ClassicComponent)', () => {
    const classic = new ClassicComponent(register)

    busInput2.setValue(2)

    SignalManager.emit(Signals.eRB, 1)
    Clock.waitAndTick(2)
    expect(classic.getNextValue()).toBe(2n)

    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(2)

    expect(classic.getCurrentValue()).toBe(2n)
    expect(classic.getNextValue()).toBe(2n)
    busInput2.update(10)
    SignalManager.emit(Signals.eRA, 1)
    Clock.waitAndTick(2)
    expect(classic.getNextValue()).toBe(0n)
})

test('InsulatorComponent', () => {
    const ins = new InsulatorComponent(
        new Register(
            'test',
            register.inputs,
            [
                Helper.makeRObj(busOutput1, Signals.RAB1),
                Helper.makeRObj(busOutput2, Signals.RAB2),
            ],
            Signals.REGSIGCLOCK
        )
    )

    busInput2.setValue(2)

    SignalManager.emit(Signals.eRB, 1)
    Clock.waitAndTick(2)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(2)

    for (const output of ins.register.outputs) {
        expect(output).toBeInstanceOf(Insulator)
    }

    expect(busOutput1.getValue()).toBe(0n)
    expect(busOutput2.getValue()).toBe(0n)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.RAB2, 5)
    Clock.waitAndTick(5)

    expect(busOutput1.getValue()).toBe(2n)
    expect(busOutput2.getValue()).toBe(2n)
})

// Avec les 2 (un classic sur un insulator)
test('Both', () => {
    const both1 = new ClassicComponent(
        new InsulatorComponent(
            new Register('test', register.inputs, [
                Helper.makeRObj(busOutput1, Signals.RAB1),
                Helper.makeRObj(busOutput2, Signals.RAB2),
            ])
        )
    )

    busInput2.setValue(2)
    SignalManager.emit(Signals.eRB, 1)
    Clock.waitAndTick(2)
    expect(both1.getNextValue()).toBe(2n)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(2)
    expect(both1.getCurrentValue()).toBe(2n)

    for (const output of both1.register.register.outputs) {
        expect(output).toBeInstanceOf(Insulator)
    }

    const both2 = new InsulatorComponent(
        new ClassicComponent(
            new Register('test', register.inputs, [
                Helper.makeRObj(busOutput1, Signals.RAB1),
                Helper.makeRObj(busOutput2, Signals.RAB2),
            ])
        )
    )

    busInput2.setValue(2)
    SignalManager.emit(Signals.eRB, 1)
    Clock.waitAndTick(2)
    expect(both2.getNextValue()).toBe(2n)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(2)
    expect(both2.getCurrentValue()).toBe(2n)

    for (const output of both2.getOutputs()) {
        expect(output).toBeInstanceOf(Insulator)
    }
})
