import { Signals } from '@/globals'

/**
 * Gestionnaire des signaux dans l'architecture
 *
 * Les signaux sont les signaux électriques envoyés à travers l'architecture
 * pour permettre certaines actions (écriture, entrée mémoire, etc...)
 *
 * Pour envoyer un signal dans l'architecture, il faut connaitre son nom et le
 * temps pendant lequel ledit signal sera émis. Ensuite il faut simplement
 * l'émettre via ce gestionnaire.
 *
 * ```js
 * // Emission du signal FIN pendant 100 UTA
 * SignalManager.emit(Signals.FIN, 100)
 * ```
 *
 * Si vous êtes ensuite intéressé par ce signal, il suffira de connecter une
 * méthode/fonction à l'horloge et vous aurez 100 UTA pour l'utiliser (voir la
 * classe `Clock` pour savoir comment connecter une fonction à l'horloge).
 *
 * Le gestionnaire promet que tout signal émis sera envoyé au moins une fois,
 * donc même si le refraichissement se fait toutes les 10 UTA, un signal émi
 * sur une durée de 1 UTA sera quand même envoyé une fois.
 */
class SignalManager {
    // ------------------------------------------------------------------------
    // Attributs.
    signals //: Object

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor() {
        this.signals = {}
        for (const signal in Signals) {
            this.signals[signal] = 0
        }
    }

    // ------------------------------------------------------------------------
    // Méthodes publiques.

    /**
     * Tous les signaux doivent baisser de tant de UTA
     *
     * @param {Number} ATU
     */
    updateSignals(ATU) {
        for (const signal in this.signals) {
            this.signals[signal] = Math.max(this.signals[signal] - ATU, 0)
        }
    }

    /**
     * Pour récupérer les signaux à un instant T, préférez enregistrer une
     * fonction dans l'horloge au lieu d'appeler cette méthode.
     */
    getSignals() {
        return this.signals
    }

    /**
     * Emet un signal donné pendant une durée de UTA
     *
     * @param {Signal} signal
     * @param {Number} ATU
     */
    emit(signal, ATU) {
        if (typeof Signals[signal] === 'undefined') {
            throw new Error(`Le signal ${signal} n'existe pas`)
        }

        this.signals[signal] = Math.max(ATU, this.signals[signal])
    }
}

export default new SignalManager()
