import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import Memory from '@/models/memory/memory-model'
import MemoryReader from '@/models/memory/memory-reader'
import MemoryWriter from '@/models/memory/memory-writer'
import Clock from '@/models/clock'
import SignalManager from '@/models/signal-manager'
import { Signals } from '@/globals'

const busRAM = new Bus()
const busInputRE = new Bus()
const busOutputRE = new Bus()
const memory = new Memory(4, 10)

new MemoryReader(memory, Signals.sM, busRAM, busOutputRE)
new MemoryWriter(memory, Signals.eM, busRAM, busInputRE)

test('Reader', () => {
    memory.setValue(1, 10)
    busRAM.setValue(1)

    let valOutput = busOutputRE.getValue()
    Clock.waitAndTick(1, 1)

    expect(busOutputRE.getValue()).toBe(valOutput)

    SignalManager.emit(Signals.sM, 1)
    Clock.waitAndTick(1, 1)

    expect(busOutputRE.getValue()).toBe(10n)
})

test('Writer', () => {
    busRAM.setValue(2)
    busInputRE.setValue(15)

    let valMemory = memory.getValue(2)
    Clock.waitAndTick(1, 1)

    expect(memory.getValue(2)).toBe(valMemory)

    SignalManager.emit(Signals.eM, 1)
    Clock.waitAndTick(1, 1)

    expect(memory.getValue(2)).toBe(15n)
})
