import { test, expect } from '@jest/globals'
import { Signals } from '@/globals'
import Bus from '@/models/bus-model'
import ERMM from '@/models/remm-model'
import Clock from '@/models/clock'
import SignalManager from '@/models/signal-manager'
import Helper from '@/helper'
import MMParser from '@/microprogrammed-memory-parser'

const inputBus = new Bus(64)
const nextAdr = new Bus()
const selMS = new Bus()
const cond = new Bus()
const remm = new ERMM(
    Helper.makeRObj(inputBus, Signals.eRA),
    Signals.REGSIGCLOCK,
    nextAdr,
    selMS,
    cond,
    Signals.SENDLEVELS,
    Signals.SENDPULSES,
    5,
    1
)
const vAdrSuiv = 498n // 0b0111110010 en binaire
const vSelMS = 2n // 0b10 en binaire
const vConds = 3n // 0b0011 en binaire
const instr = 0b000010110000100000100000100100000001000000000000n // eRI, eM, eCO, RAB1, RIB1, sM, XS, FIN
inputBus.setValue(
    MMParser.parse(498, 2, 3, [
        Signals.eRI,
        Signals.eM,
        Signals.eCO,
        Signals.RAB1,
        Signals.RIB1,
        Signals.sM,
        Signals.XS,
        Signals.FIN,
    ])
    //0b0111110010100011000010110000100000100000100100000001000000000000n
)

SignalManager.emit(Signals.eRA, 1)
Clock.waitAndTick(2, 1)
SignalManager.emit(Signals.REGSIGCLOCK, 1)
Clock.waitAndTick(2, 1)

test('Parse', () => {
    expect(
        MMParser.parse(498, 2, 3, [
            Signals.eRI,
            Signals.eM,
            Signals.eCO,
            Signals.RAB1,
            Signals.RIB1,
            Signals.sM,
            Signals.XS,
            Signals.FIN,
        ])
    ).toBe(0b0111110010100011000010110000100000100000100100000001000000000000n)
})

test('Next adress', () => {
    expect(nextAdr.getValue()).toBe(vAdrSuiv)
})

test('SelMs', () => {
    expect(selMS.getValue()).toBe(vSelMS)
})

test('Conds', () => {
    expect(cond.getValue()).toBe(vConds)
})

test('Instrs', () => {
    expect(remm.formatValueForSignals()).toBe(2n ** 63n + (instr << 15n))
})

test('Emited', () => {
    const sigs = SignalManager.getSignals()
    const triggered = [
        Signals.eRI,
        Signals.eM,
        Signals.eCO,
        Signals.RAB1,
        Signals.RIB1,
        Signals.sM,
        Signals.XS,
        Signals.FIN,
    ]

    SignalManager.emit(Signals.SENDLEVELS, 1)
    SignalManager.emit(Signals.SENDPULSES, 1)
    Clock.waitAndTick(1, 1)

    for (const [key, value] of Object.entries(sigs)) {
        if (triggered.includes(Number(key))) {
            expect(value).toBeGreaterThan(0)
        } else {
            expect(value).toBe(0)
        }
    }
})
