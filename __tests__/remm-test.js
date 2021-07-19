import { test, expect } from '@jest/globals'
import { Signals } from '@/globals'
import Bus from '@/models/bus-model'
import ERMM from '@/models/remm-model'
import Clock from '@/models/clock'
import SignalManager from '@/models/signal-manager'
import Helper from '@/helper'

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
    Signals.SENDPULSES
)
const vAdrSuiv = 498n // 0b0111110010 en binaire
const vSelMS = 2n // 0b10 en binaire
const vConds = 3n // 0b0011 en binaire
const instr = 0b00001011000100000100000100100000001000n // eRI, eM, eCO, RAB1, RIB1, sM, XS, FIN
inputBus.setValue(
    0b0111110010100011000010110000001011000100000100000100100000001000n
)
SignalManager.emit(Signals.eRA, 1)
Clock.waitAndTick(2, 1)
SignalManager.emit(Signals.REGSIGCLOCK, 1)
Clock.waitAndTick(2, 1)

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
    expect(remm.formatValueForSignals()).toBe(instr << 12n)
})

test('Emited', () => {
    const sigs = SignalManager.getSignals()
    const triggered = [
        Signals.eRI,
        Signals.eM,
        Signals.eCO,
        Signals.RAB1,
        Signals.RIB1,
        Signals.SM,
        Signals.XS,
        Signals.FIN,
    ]

    for (const [key, value] of Object.entries(sigs)) {
        if (triggered.includes(key)) {
            expect(value).toBeGreaterThan(0)
        } else {
            expect(value).toBe(0)
        }
    }
})