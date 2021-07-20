import Clock from '@/models/clock'
import { Signals } from '@/globals'

/**
 * Implémentation du compteur de phases d'un micro-séquenceur.
 *
 * Le compteur de phase est là pour, comme son nom l'indique, compter les
 * phases. Il permet de paramétrer le multiplexeur qui s'occupe d'envoyer
 * l'adresse des prochains signaux à envoyer.
 *
 * Si c'est la première phase, alors il passe le multiplexeur (binaire) en mode
 * 1, et c'est l'adresse de la première phase du cycle fetch qui est envoyée.
 *
 * Sinon, il passe en mode 0, et c'est la valeur qui sort du multiplexeur
 * différent qui est envoyé.
 *
 * Le bus de sortie prend la valeur qui correspond. C'est à dire qu'aucun
 * calcul extérieur ne doit être réalisé pour ces valeurs, car tout est déjà
 * pris en charge par cette classe.
 *
 * Ainsi, le bus de sortie doit posséder un seul fil (être de 1 bit).
 */
export default class PhaseCounter {
    // ------------------------------------------------------------------------
    // Attributs.
    endSignalSent //: Boolean
    currentPhase //: Number
    busOutput //: Bus
    switched //: Boolean

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(busOutput) {
        Clock.register(this.update.bind(this))

        this.endSignalSent = false
        this.currentPhase = 1
        this.busOutput = busOutput
        this.switched = false
    }

    // ------------------------------------------------------------------------
    // Méthodes publiques.

    update(_, signals) {
        if (signals[Signals.REGSIGCLOCK] > 0) {
            if (this.endSignalSent) {
                this.currentPhase = 1
                this.endSignalSent = false
            } else if (!this.switched) {
                this.currentPhase += 1
                this.switched = true
            }
        } else {
            this.switched = false
        }

        if (signals[Signals.FIN] > 0) {
            this.endSignalSent = true
        }

        this.setBusValue()
    }

    // ------------------------------------------------------------------------
    // Méthodes utilisées par la classe.

    setBusValue() {
        this.busOutput.setValue(Number(this.currentPhase === 1))
    }
}
