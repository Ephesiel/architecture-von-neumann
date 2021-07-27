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
import MMParser from '@/microprogrammed-memory-parser'
import { UNSIGNED, uint } from '@/integer'
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
        this.busSelMS = new Bus('Bus REMM -> selMS', NB_BITS_SELMS, UNSIGNED)
        this.busNextAddr = new Bus(
            'Bus REMM -> adresse suivante',
            MPM_BITS_ADDRESSES,
            UNSIGNED
        )
        this.busInputMM = new Bus(
            'Bus RAMM -> MM',
            MPM_BITS_ADDRESSES,
            UNSIGNED
        )
        this.busOutputMM = new Bus('Bus MM -> REMM', NB_BITS_MPM, UNSIGNED)
        this.busOutputConditionMult = new Bus(
            'Bus cond -> mult',
            MPM_BITS_ADDRESSES,
            UNSIGNED
        )
        this.busOutputNextAddrMult = new Bus(
            'Bus mult -> phase mult',
            MPM_BITS_ADDRESSES,
            UNSIGNED
        )
        this.busOutputPhaseMult = new Bus(
            'Bus phase -> RAMM',
            MPM_BITS_ADDRESSES,
            UNSIGNED
        )
        this.busOutputFetch = new Bus(
            'Bus fetch -> phase',
            MPM_BITS_ADDRESSES,
            UNSIGNED
        )
        this.busOutputPhase = new Bus('Bus phaseCounter -> phase', 1, UNSIGNED)
        this.busOutputPlus1 = new Bus(
            'Bus plus1 -> mult',
            MPM_BITS_ADDRESSES,
            UNSIGNED
        )

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
        this.phaseCounter = new PhaseCounter(this.busOutputPhase)
        this.fetch = new Register('Fetch', [], [this.busOutputFetch])

        // Instanciation de la mémoire
        this.microprogammedMemory = new Memory(MPM_BITS_ADDRESSES, NB_BITS_MPM)
        this.microprogammedMemoryReader = new MemoryReader(
            this.microprogammedMemory,
            Signals.eREMM,
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
                busInputCOPMA,
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
        this.microprogammedMemory.setValue(FETCH_PHASE1_ADDR.add(1), FETCH_PHI2)

        // REB1, XS, eRI :
        //   * Adresse Suivante : 0, pas besoin
        //   * selMS : 2, on veut l'adresse du COPMA
        //   * Cond : 0, pas besoin
        //   * Signals : 0b000010000010000000000000000100000000000000000000
        this.microprogammedMemory.setValue(FETCH_PHASE1_ADDR.add(2), FETCH_PHI3)

        // LOAD A, Imm, 10
        // Phi4 : RIB1 XS eRA Fin
        //   * Adresse Suivante : 256, pas besoin
        //   * selMS : 3, osef
        //   * Cond : 0, pas besoin
        this.microprogammedMemory.setValue(
            uint(1),
            MMParser.parse(256, 3, 0, [Signals.RIB1, Signals.XS, Signals.eRA])
        )

        // LOAD B, Imm, 12
        // Phi4 : RIB1 XS eRB Fin
        //   * Adresse Suivante : 256, pas besoin
        //   * selMS : 3, osef
        //   * Cond : 0, pas besoin
        this.microprogammedMemory.setValue(
            uint(11),
            MMParser.parse(256, 3, 0, [Signals.RIB1, Signals.XS, Signals.eRB])
        )

        // A+B -> C
        // Phi4 : RAB1 RBB2 ADD eRC Fin
        //   * Adresse Suivante : 256, pas besoin
        //   * selMS : 3, osef
        //   * Cond : 0, pas besoin
        this.microprogammedMemory.setValue(
            uint(103),
            MMParser.parse(256, 3, 0, [
                Signals.RAB1,
                Signals.RBB2,
                Signals.ADD,
                Signals.eRC,
            ])
        )

        this.microprogammedMemory.setValue(
            uint(256),
            MMParser.parse(0, 0, 0, [
                Signals.COB1,
                Signals.XP1,
                Signals.eCO,
                Signals.FIN,
            ])
        )
    }
}
