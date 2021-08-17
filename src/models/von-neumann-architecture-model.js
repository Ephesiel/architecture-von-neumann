import Bus from '@/models/bus-model'
import Clock from '@/models/clock'
import SignalManager from '@/models/signal-manager'
import Sequencer from '@/models/sequencer'
import Memory from '@/models/memory/memory-model'
import MemoryReader from '@/models/memory/memory-reader'
import MemoryWriter from '@/models/memory/memory-writer'
import Helper from '@/helper'
import ArithmeticLogicUnit from '@/models/arithmetic-logic-unit-model'
import FlagRegister from '@/models/flag-register-model'
import {
    Signals,
    NB_BITS_ARCH,
    NB_BITS_CONDS,
    NB_BITS_COPMA,
    NB_BITS_ADDRESSES,
    NB_BITS_RA,
    TIME_ATU_FOR_LEVELS,
    TIME_ATU_FOR_PULSES,
} from '@/globals'
import { UNSIGNED, uint } from '@/integer'

/**
 * Représentation de l'architecture d'un ordinateur.
 *
 * Cette architecture comporte les registres suivants :
 *   - Compteur Ordinal
 *   - Registre Instruction
 *   - Registre d'Échange
 *   - Registre A
 *   - Registre B
 *   - Registre C
 *   - Registre Index
 *   - Stack Pointer
 *   - Registre d'Adressa Mémoire
 *
 * Elle permet d'exécuter l'architecture de deux façons (pour le moment) :
 *   - Pas à pas
 *   - Phase par phase
 *
 * L'architecture pourra être exécutée instruction par instruction dans un
 * futur proche.
 *
 * Le mode pas à pas exécute les étapes suivantes dans le séquenceur :
 *   - eRAMM
 *   - eREMM
 *   - Envoie des signaux
 *
 * Le mode phase par phase exécute ces 3 étapes directement.
 */
export default class VonNeumannArchitecture {
    // ------------------------------------------------------------------------
    // Attributs.
    bus1 //: Bus
    bus2 //: Bus
    bus3 //: Bus
    busCondInput //: Bus
    busCondOutput //: Bus
    busCOPMA //: Bus
    busSM //: Bus
    busEM //: Bus
    busRAM //: Bus
    CO //: Register
    RI //: Register
    RE //: Register
    RA //: Register
    RB //: Register
    RC //: Register
    RX //: Register
    SP //: Register
    RAM //: Register
    ALU //: ArithmeticLogicUnit
    sequencer //: Sequencer
    flagRegister //: FlagRegister
    memory //: Memory
    memoryReader //: MemoryReader
    memoryWriter //: MemoryWriter
    stepByStepQueue //: Queue
    canUpdateRegisters //: Boolean

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor() {
        // Instanciation des bus
        this.bus1 = new Bus('Bus 1')
        this.bus2 = new Bus('Bus 2')
        this.bus3 = new Bus('Bus 3')
        this.busCondInput = new Bus(
            'Bus entrée condition',
            NB_BITS_CONDS,
            UNSIGNED
        )
        this.busCondOutput = new Bus('Bus sortie condition', 1, UNSIGNED)
        this.busCOPMA = new Bus('Bus envoie COPMA', NB_BITS_COPMA, UNSIGNED)
        this.busSM = new Bus('Bus sortie mémoire')
        this.busEM = new Bus('Bus entrée mémoire')
        this.busRAM = new Bus('Bus RAM -> Mémoire', NB_BITS_ADDRESSES, UNSIGNED)

        // Instanciation des registres
        this.CO = Helper.makeArchReg(
            'CO',
            [Helper.makeRObj(this.bus3, Signals.eCO)],
            [
                Helper.makeRObj(this.bus1, Signals.COB1),
                Helper.makeRObj(this.bus2, Signals.COB2),
            ]
        )
        this.RI = Helper.makeRI(
            [Helper.makeRObj(this.bus3, Signals.eRI)],
            [
                Helper.makeRObj(this.bus1, Signals.RIB1),
                Helper.makeRObj(this.bus2, Signals.RIB2),
            ],
            this.busCOPMA
        )
        this.RE = Helper.makeArchReg(
            'RE',
            [
                Helper.makeRObj(this.bus3, Signals.eRE),
                Helper.makeRObj(this.busSM, Signals.sM),
            ],
            [
                Helper.makeRObj(this.bus1, Signals.REB1),
                Helper.makeRObj(this.bus2, Signals.REB2),
                Helper.makeRObj(this.busEM, Signals.eM),
            ]
        )
        this.RX = Helper.makeArchReg(
            'RX',
            [Helper.makeRObj(this.bus3, Signals.eRX)],
            [
                Helper.makeRObj(this.bus1, Signals.RXB1),
                Helper.makeRObj(this.bus2, Signals.RXB2),
            ]
        )
        this.RA = Helper.makeArchReg(
            'RA',
            [Helper.makeRObj(this.bus3, Signals.eRA)],
            [
                Helper.makeRObj(this.bus1, Signals.RAB1),
                Helper.makeRObj(this.bus2, Signals.RAB2),
            ]
        )
        this.RB = Helper.makeArchReg(
            'RB',
            [Helper.makeRObj(this.bus3, Signals.eRB)],
            [
                Helper.makeRObj(this.bus1, Signals.RBB1),
                Helper.makeRObj(this.bus2, Signals.RBB2),
            ]
        )
        this.RC = Helper.makeArchReg(
            'RC',
            [Helper.makeRObj(this.bus3, Signals.eRC)],
            [
                Helper.makeRObj(this.bus1, Signals.RCB1),
                Helper.makeRObj(this.bus2, Signals.RCB2),
            ]
        )
        this.SP = Helper.makeArchReg(
            'SP',
            [Helper.makeRObj(this.bus3, Signals.eSP)],
            [
                Helper.makeRObj(this.bus1, Signals.SPB1),
                Helper.makeRObj(this.bus2, Signals.SPB2),
            ]
        )
        this.RAM = Helper.makeReg(
            'RAM',
            [Helper.makeRObj(this.bus3, Signals.eRAM)],
            [this.busRAM]
        )
        this.flagRegister = new FlagRegister(
            2 ** NB_BITS_CONDS,
            this.busCondInput,
            this.busCondOutput
        )
        this.setupFlagRegister()

        // Séquenceur.
        this.sequencer = new Sequencer(
            this.busCondInput,
            this.busCondOutput,
            this.busCOPMA
        )

        // ALU
        this.ALU = new ArithmeticLogicUnit([this.bus1, this.bus2], [this.bus3])
        this.setupALU()

        // Mémoire
        this.memory = new Memory(NB_BITS_ADDRESSES, NB_BITS_ARCH)
        this.memoryReader = new MemoryReader(
            this.memory,
            Signals.sM,
            this.busRAM,
            this.busSM
        )
        this.memoryWriter = new MemoryWriter(
            this.memory,
            Signals.eM,
            this.busRAM,
            this.busEM
        )

        // Queue
        this.stepByStepQueue = [
            this.eRAMM.bind(this),
            this.eREMM.bind(this),
            this.sendSignals.bind(this),
        ]

        this.canUpdateRegisters = false

        this.TEST()
    }

    setupFlagRegister() {
        const isANull = () => {
            return uint(Number(this.RA.getCurrentValue().eq(0)), 1)
        }
        const isBNull = () => {
            return uint(Number(this.RB.getCurrentValue().eq(0)), 1)
        }
        const aGreaterThan0 = () => {
            return uint(Number(this.RA.getCurrentValue().gt(0)), 1)
        }
        const bGreaterThan0 = () => {
            return uint(Number(this.RB.getCurrentValue().gt(0)), 1)
        }
        const aPair = () => {
            return uint(Number(this.RA.getCurrentValue().and(1).eq(0)), 1)
        }
        const bPair = () => {
            return uint(Number(this.RB.getCurrentValue().and(1).eq(0)), 1)
        }
        // Condition 0 => pas de condition
        this.flagRegister.setCondition(uint(1), isANull)
        this.flagRegister.setCondition(uint(2), isBNull)
        this.flagRegister.setCondition(uint(3), aGreaterThan0)
        this.flagRegister.setCondition(uint(4), bGreaterThan0)
        this.flagRegister.setCondition(uint(5), aPair)
        this.flagRegister.setCondition(uint(6), bPair)
    }

    setupALU() {
        const xs = (x) => {
            return x
        }
        const xp1 = (x) => {
            return x.add(1)
        }
        const add = (x, y) => {
            return x.add(y)
        }
        const sub = (x, y) => {
            return x.sub(y)
        }
        const mul = (x, y) => {
            return x.mult(y)
        }
        const and = (x, y) => {
            return x.and(y)
        }
        const or = (x, y) => {
            return x.or(y)
        }
        const xor = (x, y) => {
            return x.xor(y)
        }

        this.ALU.addOperation(Signals.XS, xs, 'X')
        this.ALU.addOperation(Signals.XP1, xp1, 'X + 1')
        this.ALU.addOperation(Signals.ADD, add, 'X + Y')
        this.ALU.addOperation(Signals.SUB, sub, 'X - Y')
        this.ALU.addOperation(Signals.MUL, mul, 'X * Y')
        this.ALU.addOperation(Signals.AND, and, 'X & Y')
        this.ALU.addOperation(Signals.OR, or, 'X | Y')
        this.ALU.addOperation(Signals.XOR, xor, 'X ^ Y')
    }

    // ------------------------------------------------------------------------
    // UI.

    stepByStep() {
        const fun = this.stepByStepQueue.shift()
        fun()
        this.stepByStepQueue.push(fun)
    }

    phaseByPhase() {
        this.eRAMM()
        this.eREMM()
        this.sendSignals()
    }

    instrByInstr() {
        // On exécute tout jusqu'à capter le signal FIN
    }

    eRAMM() {
        // Update seulement lorsque eRAMM, eREMM et sendSignals ont été
        // appelées au moins une fois.
        if (this.canUpdateRegisters) {
            this.updateRegisters()
        }
        console.log('eRAMM')
        SignalManager.emit(Signals.eRAMM, 5)
        Clock.waitAndTick(10, 1)
        SignalManager.emit(Signals.SWITCH_RAMM, 1)
        Clock.waitAndTick(5, 1)
    }

    eREMM() {
        console.log('eREMM')
        SignalManager.emit(Signals.eREMM, 5)
        Clock.waitAndTick(10, 1)
        SignalManager.emit(Signals.SWITCH_REMM, 1)
        Clock.waitAndTick(5, 1)
    }

    sendSignals() {
        console.log('sendSignals')
        SignalManager.emit(Signals.SENDLEVELS, 1)
        Clock.waitAndTick(TIME_ATU_FOR_LEVELS - TIME_ATU_FOR_PULSES, 1)
        SignalManager.emit(Signals.SENDPULSES, 1)
        Clock.waitAndTick(TIME_ATU_FOR_PULSES + 5, 1)
        this.canUpdateRegisters = true
    }

    updateRegisters() {
        SignalManager.emit(Signals.REGSIGCLOCK, 1)
        Clock.waitAndTick(5, 1)
    }

    TEST() {
        // LOAD A, Imm, 10
        //   -> 00000001 000000001010
        this.memory.setValue(uint(0), uint(1).leftShift(NB_BITS_RA).add(10))
        // LOAD B, Imm, 12
        //   -> 00001011 000000001100
        this.memory.setValue(uint(1), uint(11).leftShift(NB_BITS_RA).add(12))
        // A+B -> C
        //   -> 01100111 000000000000
        this.memory.setValue(uint(2), uint(103).leftShift(NB_BITS_RA))
    }
}
