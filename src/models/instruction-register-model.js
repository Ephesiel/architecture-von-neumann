import Register from '@/models/registers/register-model'
import { Signals, NB_BITS_RA } from '@/globals'

/**
 * Implémentation du registre d'instructions.
 *
 * L'écriture dans le registre d'instruction se fait durant la phase de fetch.
 * C'est la combinaison COP/MA RA qui est écrite dans la valeur actuelle du
 * registre, il faut donc la déchiffrer. Le COP/MA est codé sur 8 bits, et le
 * RA sur les 24 bits restants.
 *
 * Ainsi, il existe deux fonctions : formatCOPMA() pour récupérer seulement le
 * couple COP/MA
 */
export default class InstructionRegister extends Register {
    // ------------------------------------------------------------------------
    // Attributs.
    sequencerBus //: Bus

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(inputs, outputs, sequencerBus) {
        super(inputs, outputs, Signals.REGSIGCLOCK)

        this.sequencerBus = sequencerBus
    }

    // ------------------------------------------------------------------------
    // Méthodes utilisées par la classe.

    setOutputValue() {
        for (const output of this.outputs) {
            output.setValue(this.getRA())
        }
        this.sequencerBus.setValue(this.getCOPMA())
    }

    getCOPMA() {
        return this.currentValue >> BigInt(NB_BITS_RA)
    }

    getRA() {
        return this.currentValue & (2n ** BigInt(NB_BITS_RA) - 1n)
    }
}
