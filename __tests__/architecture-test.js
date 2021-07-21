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
import { uint } from '@/integer'

const arch = new Architecture()

test('Step by step', () => {
    arch.stepByStep()
    expect(arch.sequencer.RAMM.getCurrentValue().toNumber()).toBe(
        FETCH_PHASE1_ADDR.toNumber()
    )
    arch.stepByStep()
    expect(arch.sequencer.REMM.getCurrentValue().toNumber()).toBe(
        FETCH_PHI1.toNumber()
    )

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
    ])

    arch.stepByStep()
    expect(arch.sequencer.RAMM.getCurrentValue().toNumber()).toBe(
        FETCH_PHASE1_ADDR.add(1).toNumber()
    )
    arch.stepByStep()
    expect(arch.sequencer.REMM.getCurrentValue().toNumber()).toBe(
        FETCH_PHI2.toNumber()
    )
    passed = []
    arch.stepByStep()
    expect(passed).toStrictEqual([
        Signals.SENDLEVELS,
        Signals.sM.toString(),
        Signals.SENDPULSES,
    ])

    arch.stepByStep()
    expect(arch.sequencer.RAMM.getCurrentValue().toNumber()).toBe(
        FETCH_PHASE1_ADDR.add(2).toNumber()
    )
    arch.stepByStep()
    expect(arch.sequencer.REMM.getCurrentValue().toNumber()).toBe(
        FETCH_PHI3.toNumber()
    )
    passed = []
    arch.stepByStep()
    expect(passed).toStrictEqual([
        Signals.SENDLEVELS,
        Signals.REB1.toString(),
        Signals.XS.toString(),
        Signals.SENDPULSES,
        Signals.eRI.toString(),
    ])
})

test('ALU & Flag Register', () => {
    expect(arch.RA.getCurrentValue().toNumber()).toBe(0)
    expect(arch.flagRegister.getCondition(uint(1)).toNumber()).toBe(1)
    expect(arch.flagRegister.getCondition(uint(2)).toNumber()).toBe(1)
    expect(arch.flagRegister.getCondition(uint(3)).toNumber()).toBe(0)
    expect(arch.flagRegister.getCondition(uint(4)).toNumber()).toBe(0)
    expect(arch.flagRegister.getCondition(uint(5)).toNumber()).toBe(1)
    expect(arch.flagRegister.getCondition(uint(6)).toNumber()).toBe(1)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.XP1, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRA, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RA.getCurrentValue().toNumber()).toBe(1)
    expect(arch.flagRegister.getCondition(uint(1)).toNumber()).toBe(0)
    expect(arch.flagRegister.getCondition(uint(3)).toNumber()).toBe(1)
    expect(arch.flagRegister.getCondition(uint(5)).toNumber()).toBe(0)

    SignalManager.emit(Signals.RBB1, 5)
    SignalManager.emit(Signals.XP1, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRB, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RB.getCurrentValue().toNumber()).toBe(1)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.RBB2, 5)
    SignalManager.emit(Signals.ADD, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRA, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RA.getCurrentValue().toNumber()).toBe(2)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.RAB2, 5)
    SignalManager.emit(Signals.MUL, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRA, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RA.getCurrentValue().toNumber()).toBe(4)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.RBB2, 5)
    SignalManager.emit(Signals.SUB, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRB, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RB.getCurrentValue().toNumber()).toBe(3)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.RBB2, 5)
    SignalManager.emit(Signals.OR, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRA, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RA.getCurrentValue().toNumber()).toBe(7)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.RBB2, 5)
    SignalManager.emit(Signals.AND, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRA, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RA.getCurrentValue().toNumber()).toBe(3)

    SignalManager.emit(Signals.RAB1, 5)
    SignalManager.emit(Signals.RBB2, 5)
    SignalManager.emit(Signals.XOR, 5)
    Clock.waitAndTick(5, 1)
    SignalManager.emit(Signals.eRA, 1)
    Clock.waitAndTick(1, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 1)
    Clock.waitAndTick(1, 1)

    expect(arch.RA.getCurrentValue().toNumber()).toBe(0)
})
