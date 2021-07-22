import { test, expect } from '@jest/globals'
import { Signals, NB_BITS_RA } from '@/globals'
import Bus from '@/models/bus-model'
import InstructionRegister from '@/models/instruction-register-model'
import Clock from '@/models/clock'
import SignalManager from '@/models/signal-manager'
import Helper from '@/helper'
import { int } from '@/integer'

const busInput = new Bus()
const busOutput = new Bus()
const sequencerBus = new Bus('Bus séquenceur', 8)

const iRegister = new InstructionRegister(
    [Helper.makeRObj(busInput, Signals.eRA)],
    [busOutput],
    sequencerBus
)

const COPMA = 0b10010110
const RA = 73
const COPMARA = (COPMA << NB_BITS_RA) | RA

test('Correct values of COPMA / RA', () => {
    busInput.setValue(int(COPMARA, 32))
    SignalManager.emit(Signals.eRA, 3)
    Clock.waitAndTick(3, 1)
    SignalManager.emit(Signals.REGSIGCLOCK, 3)
    Clock.waitAndTick(3, 1)
    expect(iRegister.getCurrentValue().toNumber()).toBe(COPMARA)
    expect(iRegister.getCOPMA().toNumber()).toBe(COPMA)
    expect(iRegister.getRA().toNumber()).toBe(RA)
})
