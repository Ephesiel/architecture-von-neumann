import { test, expect } from '@jest/globals'
import SignalManager from '@/models/signal-manager'
import { Signals } from '@/globals'
import Debug, { Level } from '@/debug'

const signals = SignalManager.getSignals()

test('Constructor', () => {
    expect(Object.keys(signals).length).toBe(Object.keys(Signals).length)

    for (const signal in signals) {
        expect(signals[signal]).toBe(0)
    }
})

test('Emit error', () => {
    let warn = Debug.getMessages(Level.WARN)
    let nbBefore = warn.length
    SignalManager.emit('nawak', 10)
    let nbAfter = warn.length

    expect(nbAfter).toBe(nbBefore + 1)
})

test('Emit', () => {
    SignalManager.emit(Signals.eRAM, 10)

    for (const signal in signals) {
        if (signal === Signals.eRAM) {
            expect(signals[signal]).toBe(10)
        } else {
            expect(signals[signal]).toBe(0)
        }
    }

    SignalManager.updateSignals(4)

    for (const signal in signals) {
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
