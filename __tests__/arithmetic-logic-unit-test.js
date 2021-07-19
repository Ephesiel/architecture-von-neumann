import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import ALU from '@/models/arithmetic-logic-unit-model'
import { Signals } from '@/globals'
import Clock from '@/models/clock'
import SignalManager from '@/models/signal-manager'
import Debug, { Level } from '@/debug'

const busX = new Bus()
const busY = new Bus()
const busZ = new Bus()

const outputBus1 = new Bus()
const outputBus2 = new Bus()

const OC = new ALU([busX, busY, busZ], [outputBus1, outputBus2])

test('Constructor', () => {
    expect(OC.operations).toEqual({})
})

test('Operation 1 bus', () => {
    OC.addOperation(Signals.XP1, (x) => {
        return x + 1n
    })

    const valX = busX.getValue()

    SignalManager.emit(Signals.XP1, 1)
    Clock.waitAndTick(1, 1)

    expect(outputBus1.getValue()).toEqual(valX + 1n)
    expect(outputBus2.getValue()).toEqual(valX + 1n)

    OC.addOperation(Signals.XP1, () => {
        return 0n
    })

    SignalManager.emit(Signals.XP1, 1)
    Clock.waitAndTick(1, 1)

    expect(outputBus1.getValue()).toEqual(0n)
    expect(outputBus2.getValue()).toEqual(0n)
})

test('Operation 2 bus', () => {
    OC.addOperation(Signals.ADD, (x, y) => {
        return x + y
    })

    busX.setValue(5)
    busY.setValue(12)
    busZ.setValue(33)

    SignalManager.emit(Signals.ADD, 1)
    Clock.waitAndTick(1, 1)

    expect(outputBus1.getValue()).toEqual(17n)
    expect(outputBus2.getValue()).toEqual(17n)
})

test('Operation 3 bus', () => {
    OC.addOperation(Signals.ADD, (x, y, z) => {
        return x + y + z
    })

    busX.setValue(5)
    busY.setValue(12)
    busZ.setValue(33)

    SignalManager.emit(Signals.ADD, 1)
    Clock.waitAndTick(1, 1)

    expect(outputBus1.getValue()).toEqual(50n)
    expect(outputBus2.getValue()).toEqual(50n)
})

test('Bad signals', () => {
    OC.addOperation(Signals.BADSIG, (x) => {
        return x + 1n
    })

    const val1 = outputBus1.getValue()
    const val2 = outputBus2.getValue()

    SignalManager.emit(Signals.BADSIG, 1)
    Clock.waitAndTick(1, 1)

    expect(outputBus1.getValue()).toEqual(val1)
    expect(outputBus2.getValue()).toEqual(val2)
})

test('Multiple signals', () => {
    OC.addOperation(Signals.ADD, () => 0)
    OC.addOperation(Signals.XP1, () => 0)

    SignalManager.emit(Signals.ADD, 1)
    SignalManager.emit(Signals.XP1, 1)

    const critMessages = Debug.getMessages(Level.CRIT)
    const size = critMessages.length

    Clock.waitAndTick(1, 1)

    expect(critMessages.length).toBe(size + 1)
})
