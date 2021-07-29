import SignalManager from '@/models/signal-manager'
import { reactive } from 'vue'
import { ATU_BETWEEN_UPDATE } from '@/globals'

/**
 * Gestionnaire du temps dans l'architecture.
 *
 * Nous notons le temps en UTA (Unité de Temps de l'Architecture).
 * Lors du lancement de l'application, cette horloge va tourner, envoyant une
 * update toutes les x UTA.
 *
 * Pour avoir une méthode ou une fonction qui est appelée à chaque update, il
 * faut l'enregistrer dans l'horloge :
 *
 * ```js
 * Clock.register('myUpdateFunction')
 * ```
 *
 * Dans le cas d'une méthode, il faut donner l'objet, puis la méthode comme une
 * string
 *
 * ```js
 * Clock.register(this, 'myUpdateMethod')
 * ```
 *
 * La méthode/fonction donnée peut prendre jusqu'à deux arguments :
 *  - Le premier est le nombre de UTA passées depuis la dernière update. Cette
 *    valeur est souvent la même, mais il se peut qu'elle soit parfois
 *    différente.
 *  - Le second est un objet représentant tous les signaux de l'architecture.
 *    Les clés de l'objet sont les signaux (voir `SignalManager` et
 *    `globals.Signals`).
 *    Les valeurs représentent le temps restant avant que le signal n'arrête
 *    son émission.
 *    Lorsque la valeur est 0, cela signifie que le signal est éteint.
 *
 * ```js
 * myUpdateFunction(ATU, signals) {
 *     console.log(`${ATU} UTA sont passées depuis la dernière update`)
 *     for (const signal in signals) {
 *         if (signals[signal] > 0) {
 *             console.log(`Le signal ${signal} est activé pendant encore ${signals[signal]} UTA`)
 *         }
 *         else {
 *             console.log(`Le signal ${signal} est désactivé`)
 *         }
 *     }
 * }
 * ```
 *
 * Notes : Dans le code les variables UTA seront nommées ATU pour la convention
 * des variables en anglais (Architecture Time's Unit)
 */
class Clock {
    // ------------------------------------------------------------------------
    // Attributs.
    updateCallbacks //: Array
    totalATU //: Number
    prevATU //: Number

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor() {
        console.log('clock constructed')
        this.totalATU = 0
        this.prevATU = 0
        this.updateCallbacks = []
    }

    // ------------------------------------------------------------------------
    // Méthodes publiques.

    /**
     * Cette méthode doit être appelée pour ajouter une fonction/méthode à
     * appeler à chaque update.
     *
     * Elle peut prendre un ou deux paramètres.
     *
     * ```js
     * // Enregistre la méthode `this.update`
     * Clock.register(this)
     *
     * // Enregistre la méthode `this.maMethode`
     * Clock.register(this, 'maMethode')
     *
     * // Enregistre la fonction 'maFonction'
     * Clock.register('maFonction')
     *
     * // Enregistre la fonction anonyme associée
     * Clock.register(() => { console.log('updated!') })
     *
     * // Si vous voulez modifier l'objet actuel dans une méthode anonyme, il
     * // faut donner un paramètre à la méthode qui sera équivalent à this.
     * // Pour modifier une valeur de l'objet, il faudra utiliser ce paramètre.
     * Clock.register(this, (obj) => {
     *     obj.prop += 3 // va bien augmenter la propriété prop de l'objet this
     *     this.prop += 3 // Ne va rien augmenter du tout
     * })
     * ```
     *
     * les méthodes enregistrées seront appelées à chaque update et peuvent
     * prendre jusqu'à deux paramètres :
     *  1. Le nombre de UTA passées depuis la dernière update
     *  2. Les signaux actifs
     *
     * Pour le cas spécifique ou l'objet doit être également paramètre de la
     * fonction, cette dernière peut prendre jusqu'à 3 paramètres :
     *  1. L'objet à modifier.
     *  2. UTA
     *  3. Signaux
     */
    register(obj, fun = 'update') {
        if (typeof obj === 'function') {
            this.updateCallbacks.push(obj)
        } else if (typeof obj === 'object' && typeof obj[fun] === 'function') {
            this.updateCallbacks.push(obj[fun].bind(reactive(obj)))
        } else if (typeof fun === 'function') {
            this.updateCallbacks.push((ATU, signals) => {
                fun(reactive(obj), ATU, signals)
            })
        }
    }

    /**
     * Envoie une update sur toutes les callbacks enregistrées
     */
    tick() {
        const diffATU = this.totalATU - this.prevATU
        this.prevATU = this.totalATU

        // On modifie les signaux avant d'appeler les fonctions enregistrées.
        // C'est au cas où un signal serait émis dans l'une de ces fonctions,
        // il ne doit pas être modifié avant même d'avoir pu être envoyé une
        // fois

        // On fait une copie des signaux, sinon leur modification sera impactée
        // dans les fonctions enregistrées
        const signals = { ...SignalManager.getSignals() }
        SignalManager.updateSignals(diffATU)

        for (const callback of this.updateCallbacks) {
            callback(diffATU, signals)
        }
    }

    /**
     * Attend un certain nombre de UTA
     * Attention, attendre ne va pas appeler les méthodes d'update.
     *
     * @param {Number} ATU
     */
    wait(ATU) {
        this.totalATU += Number(ATU)
    }

    /**
     * Attend et fait une update toutes les tickDiff UTA
     * Une dernière update est faite à la fin s'il reste du temps d'attente
     *
     * @param {Number} ATU Le temps d'attente
     * @param {Number} tickDiff Le temps entre 2 updates
     */
    waitAndTick(ATU, tickDiff = ATU_BETWEEN_UPDATE) {
        ATU = Number(ATU)
        tickDiff = Number(tickDiff)

        while (ATU >= tickDiff) {
            ATU -= tickDiff
            this.wait(tickDiff)
            this.tick()
        }

        if (ATU > 0) {
            this.wait(ATU)
            this.tick()
        }
    }

    timePassedSinceStart() {
        return this.totalATU
    }
}

export default new Clock()
