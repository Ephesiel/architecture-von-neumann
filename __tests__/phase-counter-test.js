import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import PhaseCounter from '@/models/phase-counter-model'
import Clock from '@/models/clock'
import SignalManager from '@/models/signal-manager'
import { Signals } from '@/globals'
import { UNSIGNED } from '@/integer'

const busOutput = new Bus('', 1, UNSIGNED)
const phaseCounter = new PhaseCounter(busOutput)

test('Updating output', () => {
    Clock.waitAndTick(1, 1)
    expect(busOutput.getValue().toNumber()).toBe(1)
})

test('Next phase', () => {
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)
    expect(busOutput.getValue().toNumber()).toBe(0)
    expect(phaseCounter.currentPhase.toNumber()).toBe(2)
})

test('End signal', () => {
    SignalManager.emit(Signals.FIN, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)
    expect(busOutput.getValue().toNumber()).toBe(1)
    expect(phaseCounter.currentPhase.toNumber()).toBe(1)
})
