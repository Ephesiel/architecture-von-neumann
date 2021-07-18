import { test, expect } from '@jest/globals'
import SignalManager from '@/models/signal-manager'
import { Signals } from '@/globals'

const signals = SignalManager.getSignals()

test('Constructor', () => {
    expect(Object.keys(signals).length).toBe(Object.keys(Signals).length)

    for (const signal in signals) {
        expect(signals[signal]).toBe(0)
    }
})

test('Emit error', () => {
    SignalManager.emit('nawak', 10)

    for (const signal in signals) {
        expect(signals[signal]).toBe(0)
    }
})

test('Emit', () => {
    SignalManager.emit(Signals.eRAM, 10)

    for (const signal of Object.values(signals)) {
        if (signal === Signals.eRAM) {
            expect(signals[signal]).toBe(10)
        } else {
            expect(signals[signal]).toBe(0)
        }
    }

    SignalManager.updateSignals(4)

    for (const signal of Object.values(signals)) {
        if (signal === Signals.eRAM) {
            expect(signals[signal]).toBe(6)
        } else {
            expect(signals[signal]).toBe(0)
        }
    }

    SignalManager.updateSignals(12)

    for (const signal in signals) {
        expect(signals[signal]).toBe(0)
    }
})
