import Memory from '@/models/memory/memory-model'
import MemoryReader from '@/models/memory/memory-reader'
import Bus from '@/models/bus-model'
import Multiplexer from '@/models/multiplexer-model'
import Register from '@/models/registers/register-model'
import PhaseCounter from '@/models/phase-counter-model'
import Plus1 from '@/models/plus1-model'
import ERMM from '@/models/remm-model'
import {
    NB_BITS_MPM,
    Signals,
    MPM_BITS_ADDRESSES,
    TIME_ATU_FOR_LEVELS,
    TIME_ATU_FOR_PULSES,
    FETCH_PHASE1_ADDR,
    NB_BITS_SELMS,
    FETCH_PHI1,
    FETCH_PHI2,
    FETCH_PHI3,
} from '@/globals'
import Helper from '@/helper'

/**
 * Implémentation du séquenceur d'instructions.
 *
 * Un séquenceur, ou micro-séquenceur, est une partie du registre d'instruction
 * qui permet d'exécuter les micro-instructions à l'adresse envoyée par le bus
 * provenant du registre d'instruction.
 *
 * Un séquenceur est composé de plusieurs composants :
 *   - La mémoire de microprogrammation
 *   - Son registre d'adresse et son registre d'échange
 *   - Un compteur de phase, ainsi qu'un "Plus1"
 *   - Un registre qui contient l'adresse de début du fetch, et un qui contient
 *     l'adresse du COPMA
 *   - 3 multiplexeurs : 1 de condition, 1 de phase, et 1 pour le calcul de
 *     l'adresse suivante.
 *
 * Cette classe est une classe de stockage, tout est géré au niveau supérieur
 * (dans l'architecture même).
 */
export default class Sequencer {
    // ------------------------------------------------------------------------
    // Attributs.
    microprogammedMemory //: Memory
    microprogammedMemoryReader //: MemoryReader
    busSelMS //: Bus
    busNextAddr //: Bus
    busInputMM //: Bus
    busOutputMM //: Bus
    busOutputConditionMult //: Bus
    busOutputNextAddrMult //: Bus
    busOutputPhaseMult //: Bus
    busOutputCOPMA //: Bus
    busOutputFetch //: Bus
    busOutputPhase //: Bus
    busOutputPlus1 //: Bus
    conditiontMult //: Multiplexer
    nextAddrMult //: Multiplexer
    phaseMult //: Multiplexer
    RAMM //: Register
    REMM //: ERMM
    plus1 //: Plus1
    COPMA //: Register
    phaseCounter //: PhaseCounter
    fetch //: Register

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(busInputCond, busOutputCond, busInputCOPMA) {
        // Instanciation des bus
        this.busSelMS = new Bus(NB_BITS_SELMS)
        this.busNextAddr = new Bus(MPM_BITS_ADDRESSES)
        this.busInputMM = new Bus(MPM_BITS_ADDRESSES)
        this.busOutputMM = new Bus(NB_BITS_MPM)
        this.busOutputConditionMult = new Bus(MPM_BITS_ADDRESSES)
        this.busOutputNextAddrMult = new Bus(MPM_BITS_ADDRESSES)
        this.busOutputPhaseMult = new Bus(MPM_BITS_ADDRESSES)
        this.busOutputCOPMA = new Bus(MPM_BITS_ADDRESSES)
        this.busOutputFetch = new Bus(MPM_BITS_ADDRESSES)
        this.busOutputPhase = new Bus(1)
        this.busOutputPlus1 = new Bus(MPM_BITS_ADDRESSES)

        // Instanciation des registres
        this.RAMM = new Register(
            'RAMM',
            [Helper.makeRObj(this.busOutputPhaseMult, Signals.eRAMM)],
            [this.busInputMM],
            Signals.SWITCH_RAMM
        )
        this.REMM = new ERMM(
            Helper.makeRObj(this.busOutputMM, Signals.eREMM),
            Signals.SWITCH_REMM,
            this.busNextAddr,
            this.busSelMS,
            busInputCond,
            Signals.SENDLEVELS,
            Signals.SENDPULSES,
            TIME_ATU_FOR_LEVELS,
            TIME_ATU_FOR_PULSES
        )
        this.plus1 = new Plus1(this.busInputMM, this.busOutputPlus1)
        this.COPMA = Helper.makeReg(
            'COPMA',
            [Helper.makeRObj(busInputCOPMA)],
            [this.busOutputCOPMA]
        )
        this.phaseCounter = new PhaseCounter(this.busOutputPhase)
        this.fetch = new Register('Fetch', [], [this.busOutputFetch])

        // Instanciation de la mémoire
        this.microprogammedMemory = new Memory(MPM_BITS_ADDRESSES, NB_BITS_MPM)
        this.microprogammedMemoryReader = new MemoryReader(
            this.microprogammedMemory,
            Signals.eRAMM,
            this.busInputMM,
            this.busOutputMM
        )

        // Instanciation des multiplexeurs
        this.conditiontMult = new Multiplexer(
            [this.busOutputPlus1, this.busNextAddr],
            this.busOutputConditionMult,
            busOutputCond
        )
        this.nextAddrMult = new Multiplexer(
            [
                this.busOutputPlus1,
                this.busOutputConditionMult,
                this.busOutputCOPMA,
                this.busNextAddr,
            ],
            this.busOutputNextAddrMult,
            this.busSelMS
        )
        this.phaseMult = new Multiplexer(
            [this.busOutputNextAddrMult, this.busOutputFetch],
            this.busOutputPhaseMult,
            this.busOutputPhase
        )

        this.setupFetch()
    }

    setupFetch() {
        this.fetch.currentValue = FETCH_PHASE1_ADDR
        this.fetch.nextValue = FETCH_PHASE1_ADDR

        // COB1, XS, eRAM :
        //   * Adresse Suivante : 0, pas besoin
        //   * selMS : 0, on veut l'adresse actuelle + 1
        //   * Cond : 0, pas besoin
        //   * Signals : 0b000000001000000000000010000100000000000000000000
        this.microprogammedMemory.setValue(FETCH_PHASE1_ADDR, FETCH_PHI1)

        // sM :
        //   * Adresse Suivante : 0, pas besoin
        //   * selMS : 0, on veut l'adresse actuelle + 1
        //   * Cond : 0, pas besoin
        //   * Signals : 0b000000000000000000000000000001000000000000000000
        this.microprogammedMemory.setValue(FETCH_PHASE1_ADDR + 1, FETCH_PHI2)

        // REB1, XS, eRI :
        //   * Adresse Suivante : 0, pas besoin
        //   * selMS : 2, on veut l'adresse du COPMA
        //   * Cond : 0, pas besoin
        //   * Signals : 0b000010000010000000000000000100000000000000000000
        this.microprogammedMemory.setValue(FETCH_PHASE1_ADDR + 2, FETCH_PHI3)
    }
}
