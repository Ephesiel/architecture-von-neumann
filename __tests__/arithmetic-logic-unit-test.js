import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import ALU from '@/models/arithmetic-logic-unit-model'
import { Signals, MAXIMUM_ALLOWED_BUS_POWER_TIME } from '@/globals'
import Clock from '@/models/clock'
import SignalManager from '@/models/signal-manager'
import Debug, { Level } from '@/debug'
import { int } from '@/integer'

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
        return x.add(1)
    })

    const valX = busX.getValue().toNumber()
    const valOB1 = outputBus1.getValue().toNumber()
    const valOB2 = outputBus2.getValue().toNumber()

    SignalManager.emit(Signals.XP1, 1)
    Clock.waitAndTick(1, 1)

    expect(outputBus1.getValue().toNumber()).toEqual(valX + 1)
    expect(outputBus2.getValue().toNumber()).toEqual(valX + 1)
    expect(OC.getLastOutputedValue().toNumber()).toEqual(valX + 1)

    Clock.waitAndTick(MAXIMUM_ALLOWED_BUS_POWER_TIME + 1, 1)

    expect(outputBus1.getValue().toNumber()).toEqual(valOB1)
    expect(outputBus2.getValue().toNumber()).toEqual(valOB2)
    expect(OC.getLastOutputedValue().toNumber()).toEqual(valX + 1)

    OC.addOperation(Signals.XP1, () => {
        return int(0)
    })

    SignalManager.emit(Signals.XP1, 1)
    Clock.waitAndTick(1, 1)

    expect(outputBus1.getValue().toNumber()).toEqual(0)
    expect(outputBus2.getValue().toNumber()).toEqual(0)
    expect(OC.getLastOutputedValue().toNumber()).toEqual(0)

    expect(Object.keys(OC.getAllOperations())).toContain(Signals.XP1.toString())
})

test('Operation 2 bus', () => {
    OC.addOperation(Signals.ADD, (x, y) => {
        return x.add(y)
    })

    busX.setValue(int(5))
    busY.setValue(int(12))
    busZ.setValue(int(33))

    SignalManager.emit(Signals.ADD, 1)
    Clock.waitAndTick(1, 1)

    expect(outputBus1.getValue().toNumber()).toEqual(17)
    expect(outputBus2.getValue().toNumber()).toEqual(17)
    expect(OC.getLastOutputedValue().toNumber()).toEqual(17)

    expect(Object.keys(OC.getAllOperations())).toContain(Signals.ADD.toString())
})

test('Operation 3 bus', () => {
    OC.addOperation(Signals.ADD, (x, y, z) => {
        return x.add(y).add(z)
    })

    busX.setValue(int(5))
    busY.setValue(int(12))
    busZ.setValue(int(33))

    SignalManager.emit(Signals.ADD, 1)
    Clock.waitAndTick(1, 1)

    expect(outputBus1.getValue().toNumber()).toEqual(50)
    expect(outputBus2.getValue().toNumber()).toEqual(50)
    expect(OC.getLastOutputedValue().toNumber()).toEqual(50)
})

test('Bad signals', () => {
    OC.addOperation(Signals.BADSIG, (x) => {
        return x.add(1)
    })

    const val1 = outputBus1.getValue()
    const val2 = outputBus2.getValue()
    const valOC = OC.getLastOutputedValue()

    SignalManager.emit(Signals.BADSIG, 1)
    Clock.waitAndTick(1, 1)

    expect(outputBus1.getValue()).toEqual(val1)
    expect(outputBus2.getValue()).toEqual(val2)
    expect(OC.getLastOutputedValue()).toEqual(valOC)
})

test('Multiple signals', () => {
    OC.addOperation(Signals.ADD, () => int(0))
    OC.addOperation(Signals.XP1, () => int(0))

    SignalManager.emit(Signals.ADD, 1)
    SignalManager.emit(Signals.XP1, 1)

    const critMessages = Debug.getMessages(Level.CRIT)
    const size = critMessages.length

    Clock.waitAndTick(1, 1)

    expect(critMessages.length).toBe(size + 1)

    expect(Object.keys(OC.getAllOperations())).toContain(Signals.ADD.toString())
    expect(Object.keys(OC.getAllOperations())).toContain(Signals.XP1.toString())
})
