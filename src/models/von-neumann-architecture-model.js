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
} from '@/globals'

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

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor() {
        // Instanciation des bus
        this.bus1 = new Bus(NB_BITS_ARCH)
        this.bus2 = new Bus(NB_BITS_ARCH)
        this.bus3 = new Bus(NB_BITS_ARCH)
        this.busCondInput = new Bus(NB_BITS_CONDS)
        this.busCondOutput = new Bus(1)
        this.busCOPMA = new Bus(NB_BITS_COPMA)
        this.busSM = new Bus(NB_BITS_ARCH)
        this.busEM = new Bus(NB_BITS_ARCH)
        this.busRAM = new Bus(NB_BITS_ADDRESSES)

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
        this.RAM = Helper.makeArchReg(
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
    }

    setupFlagRegister() {
        const isANull = () => {
            return Number(this.RA.getCurrentValue() === 0n)
        }
        const isBNull = () => {
            return Number(this.RB.getCurrentValue() === 0n)
        }
        const aGreaterThan0 = () => {
            return Number(this.RA.getCurrentValue() > 0n)
        }
        const bGreaterThan0 = () => {
            return Number(this.RB.getCurrentValue() > 0n)
        }
        const aPair = () => {
            return Number((this.RA.getCurrentValue() & 1n) === 0n)
        }
        const bPair = () => {
            return Number((this.RB.getCurrentValue() & 1n) === 0n)
        }
        // Condition 0 => pas de condition
        this.flagRegister.setCondition(1, isANull)
        this.flagRegister.setCondition(2, isBNull)
        this.flagRegister.setCondition(3, aGreaterThan0)
        this.flagRegister.setCondition(4, bGreaterThan0)
        this.flagRegister.setCondition(5, aPair)
        this.flagRegister.setCondition(6, bPair)
    }

    setupALU() {
        this.ALU.addOperation(Signals.XS, (x) => {
            return x
        })
        this.ALU.addOperation(Signals.XP1, (x) => {
            return x + 1n
        })
        this.ALU.addOperation(Signals.ADD, (x, y) => {
            return x + y
        })
        this.ALU.addOperation(Signals.SUB, (x, y) => {
            return x - y
        })
        this.ALU.addOperation(Signals.MUL, (x, y) => {
            return x * y
        })
        this.ALU.addOperation(Signals.AND, (x, y) => {
            return x & y
        })
        this.ALU.addOperation(Signals.OR, (x, y) => {
            return x | y
        })
        this.ALU.addOperation(Signals.XOR, (x, y) => {
            return x ^ y
        })
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
        console.log('eRAMM')
        SignalManager.emit(Signals.eRAMM, 15)
        Clock.waitAndTick(5, 1)
        SignalManager.emit(Signals.SWITCH_RAMM, 1)
        Clock.waitAndTick(5, 1)
    }

    eREMM() {
        console.log('eREMM')
        SignalManager.emit(Signals.eREMM, 5)
        Clock.waitAndTick(5, 1)
        SignalManager.emit(Signals.SWITCH_REMM, 5)
        Clock.waitAndTick(5, 1)
    }

    sendSignals() {
        console.log('sendSignals')
        SignalManager.emit(Signals.SENDLEVELS, 1)
        Clock.waitAndTick(170)
        SignalManager.emit(Signals.SENDPULSES, 1)
        Clock.waitAndTick(15, 1)
        SignalManager.emit(Signals.REGSIGCLOCK, 10)
        Clock.waitAndTick(15, 1)
    }
}
