import Register from '@/models/registers/register-model'
import { PulseSignals, LevelSignals } from '@/signals'
import SignalManager from '@/models/signal-manager'
import {
    NB_BITS_MPM,
    NB_BITS_INSTR,
    NB_BITS_CONDS,
    NB_BITS_SELMS,
    NB_BITS_ADR,
} from '@/globals'

/**
 * Implémentation du Registre d'Échange de la Mémoire Microprogrammée (ERMM en
 * anglais).
 *
 * Ce registre est un peu particulier, dans le sens où il a trois sorties, qui
 * doivent être liées à des composants différents, et surtout avoir des valeurs
 * différentes.
 *
 * De plus, il possède des signaux internes qui lui permettent d'envoyer des
 * niveaux ou des impulsions, et donc de mettre à jour l'architecture en
 * conséquence.
 *
 * Les signaux envoyés correspondent à la valeur du bus d'entrée, où un signal
 * correspond à un bit. Le bus d'entrée doit faire 64 bits, et ils sont divisés
 * dans l'ordre suivant :
 *   - 10 bits pour l'adresse suivante (jusqu'à 1024 adresses dans la MM)
 *   - 2 bits pour le selMS (4 choix dans le multiplexeur)
 *   - 4 bits pour les conditions (6 conditions actuellement, 8 possibles)
 *   - Le reste pour les signaux (48 bits)
 *
 * Dans le fichier signals.js, on défini le bit sur lequel est le signal en
 * valeur des clés (signaux). Par exemple, si c'est 0, alors ce sera sur le bit
 * juste après les conditions (si c'est 47, ce sera le dernier bit de la
 * valeur).
 */
export default class ERMM extends Register {
    // ------------------------------------------------------------------------
    // Attributs.
    busNextAdr //: Bus
    busSelMS //: Bus
    busCond //: Bus
    signalSendLevels //: Signal
    signalSendPulses //: Signal
    timeATULevels //: ATU
    timeATUPulses //: ATU
    pulses //: Signal[]
    levels //: Signal[]

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(
        inputBus,
        signalClockTick,
        busNextAdr,
        busSelMS,
        busCond,
        signalSendLevels,
        signalSendPulses,
        timeATULevels,
        timeATUPulses
    ) {
        super('REMM', [inputBus], [], signalClockTick)
        this.busNextAdr = busNextAdr
        this.busSelMS = busSelMS
        this.busCond = busCond
        this.signalSendLevels = signalSendLevels
        this.signalSendPulses = signalSendPulses
        this.timeATULevels = timeATULevels
        this.timeATUPulses = timeATUPulses
        this.pulses = []
        this.levels = []
    }

    // ------------------------------------------------------------------------
    // Méthodes publiques.

    update(ATU, signals) {
        super.update(ATU, signals)

        if (signals[this.signalClockTick]) {
            this.levels = []
            this.pulses = []
        }

        this.updateSignals()

        if (signals[this.signalSendLevels] > 0) {
            this.sendLevels()
        }
        if (signals[this.signalSendPulses] > 0) {
            this.sendPulses()
        }
    }

    setOutputValue() {
        this.busNextAdr.setValue(this.formatValueForAdr())
        this.busSelMS.setValue(this.formatValueForSelMS())
        this.busCond.setValue(this.formatValueForCond())
    }

    // -----------------------------------------------------------------------
    // Méthodes privées.

    sendLevels() {
        this.sendSignals(this.levels, this.timeATULevels)
        this.levels = []
    }

    sendPulses() {
        this.sendSignals(this.pulses, this.timeATUPulses)
        this.pulses = []
    }

    sendSignals(arr, time) {
        arr.map((signal) => {
            SignalManager.emit(signal, time)
        })
    }

    formatValueForAdr() {
        return this.getCurrentValue().slice(
            NB_BITS_MPM - NB_BITS_ADR,
            NB_BITS_ADR
        )
    }

    formatValueForSelMS() {
        return this.getCurrentValue().slice(
            NB_BITS_MPM - NB_BITS_ADR - NB_BITS_SELMS,
            NB_BITS_SELMS
        )
    }

    formatValueForCond() {
        return this.getCurrentValue().slice(NB_BITS_INSTR, NB_BITS_CONDS)
    }

    updateSignals() {
        this.updateArrayIfSignalIsFound(PulseSignals, this.pulses)
        this.updateArrayIfSignalIsFound(LevelSignals, this.levels)
    }

    updateArrayIfSignalIsFound(obj, arr) {
        const value = this.formatValueForSignals()

        for (const bits of Object.values(obj)) {
            if (
                value.bit(NB_BITS_MPM - bits - 1) === 1 &&
                !arr.includes(bits)
            ) {
                arr.push(bits)
            }
        }
    }

    formatValueForSignals() {
        return this.getCurrentValue().leftShift(
            NB_BITS_ADR + NB_BITS_CONDS + NB_BITS_SELMS
        )
    }
}
