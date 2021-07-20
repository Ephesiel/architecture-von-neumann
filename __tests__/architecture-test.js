import { test, expect } from '@jest/globals'
import Architecture from '@/models/von-neumann-architecture-model'
import {
    FETCH_PHASE1_ADDR,
    FETCH_PHI1,
    FETCH_PHI2,
    FETCH_PHI3,
    Signals,
} from '@/globals'
import Clock from '@/models/clock'
import SignalManager from '@/models/signal-manager'

const arch = new Architecture()

test('Step by step', () => {
    arch.stepByStep()
    expect(arch.sequencer.RAMM.getCurrentValue()).toBe(
        BigInt(FETCH_PHASE1_ADDR)
    )
    arch.stepByStep()
    expect(arch.sequencer.REMM.getCurrentValue()).toBe(FETCH_PHI1)

    let passed = []
    const testSignals = (ATU, signals) => {
        for (const [signal, val] of Object.entries(signals)) {
            if (val > 0 && !passed.includes(signal)) {
                passed.push(signal)
            }
        }
    }
    Clock.register(testSignals)

    arch.stepByStep()
    expect(passed).toStrictEqual([
        Signals.SENDLEVELS,
        Signals.COB1.toString(),
        Signals.XS.toString(),
        Signals.SENDPULSES,
        Signals.eRAM.toString(),
        Signals.REGSIGCLOCK,
    ])

    arch.stepByStep()
    expect(arch.sequencer.RAMM.getCurrentValue()).toBe(
        BigInt(FETCH_PHASE1_ADDR + 1)
    )
    arch.stepByStep()
    expect(arch.sequencer.REMM.getCurrentValue()).toBe(FETCH_PHI2)
    passed = []
    arch.stepByStep()
    expect(passed).toStrictEqual([
        Signals.SENDLEVELS,
        Signals.sM.toString(),
        Signals.SENDPULSES,
        Signals.REGSIGCLOCK,
    ])

    arch.stepByStep()
    expect(arch.sequencer.RAMM.getCurrentValue()).toBe(
        BigInt(FETCH_PHASE1_ADDR + 2)
    )
    arch.stepByStep()
    expect(arch.sequencer.REMM.getCurrentValue()).toBe(FETCH_PHI3)
    passed = []
    arch.stepByStep()
    expect(passed).toStrictEqual([
        Signals.SENDLEVELS,
        Signals.REB1.toString(),
        Signals.XS.toString(),
        Signals.SENDPULSES,
        Signals.eRI.toString(),
        Signals.REGSIGCLOCK,
    ])
})

test('ALU & Flag Register', () => {
    expect(arch.RA.getCurrentValue()).toBe(0n)
    expect(arch.flagRegister.getCondition(1)).toBe(1)
    expect(arch.flagRegister.getCondition(2)).toBe(1)
    expect(arch.flagRegister.getCondition(3)).toBe(0)
    expect(arch.flagRegister.getCondition(4)).toBe(0)
    expect(arch.flagRegister.getCondition(5)).toBe(1)
    expect(arch.flagRegister.getCondition(6)).toBe(1)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.XP1, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRA, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RA.getCurrentValue()).toBe(1n)
    expect(arch.flagRegister.getCondition(1)).toBe(0)
    expect(arch.flagRegister.getCondition(3)).toBe(1)
    expect(arch.flagRegister.getCondition(5)).toBe(0)

    SignalManager.emit(Signals.RBB1, 5)
    SignalManager.emit(Signals.XP1, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRB, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RB.getCurrentValue()).toBe(1n)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.RBB2, 5)
    SignalManager.emit(Signals.ADD, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRA, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RA.getCurrentValue()).toBe(2n)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.RAB2, 5)
    SignalManager.emit(Signals.MUL, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRA, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RA.getCurrentValue()).toBe(4n)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.RBB2, 5)
    SignalManager.emit(Signals.SUB, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRB, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RB.getCurrentValue()).toBe(3n)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.RBB2, 5)
    SignalManager.emit(Signals.OR, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRA, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RA.getCurrentValue()).toBe(7n)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.RBB2, 5)
    SignalManager.emit(Signals.AND, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRA, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RA.getCurrentValue()).toBe(3n)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.RBB2, 5)
    SignalManager.emit(Signals.XOR, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRA, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RA.getCurrentValue()).toBe(0n)
})
