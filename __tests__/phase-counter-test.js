import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import PhaseCounter from '@/models/phase-counter-model'
import Clock from '@/models/clock'
import SignalManager from '@/models/signal-manager'
import { Signals } from '@/globals'

const busOutput = new Bus(1)
const phaseCounter = new PhaseCounter(busOutput)

test('Updating output', () => {
    Clock.waitAndTick(1, 1)
    expect(busOutput.getValue()).toBe(1n)
})

test('Next phase', () => {
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)
    expect(busOutput.getValue()).toBe(0n)
    expect(phaseCounter.currentPhase).toBe(2)
})

test('End signal', () => {
    SignalManager.emit(Signals.FIN, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)
    expect(busOutput.getValue()).toBe(1n)
    expect(phaseCounter.currentPhase).toBe(1)
})
