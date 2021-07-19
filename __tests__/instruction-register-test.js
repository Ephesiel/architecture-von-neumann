import { test, expect } from '@jest/globals'
import { Signals, NB_BITS_RA } from '@/globals'
import Bus from '@/models/bus-model'
import InstructionRegister from '@/models/instruction-register-model'
import Clock from '@/models/clock'
import SignalManager from '@/models/signal-manager'
import Helper from '@/helper'

const busInput = new Bus()
const busOutput = new Bus()
const sequencerBus = new Bus(8)

const iRegister = new InstructionRegister(
    [Helper.makeRObj(busInput, Signals.eRA)],
    [busOutput],
    sequencerBus
)

const COPMA = 0b10010110n
const RA = 73n
const COPMARA = (COPMA << BigInt(NB_BITS_RA)) | RA

test('Correct values of COPMA / RA', () => {
    busInput.setValue(COPMARA)
    SignalManager.emit(Signals.eRA, 3)
    Clock.waitAndTick(3, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 3)
    Clock.waitAndTick(3, 1)
    expect(iRegister.getCurrentValue()).toBe(COPMARA)
    expect(iRegister.getCOPMA()).toBe(COPMA)
    expect(iRegister.getRA()).toBe(RA)
})
