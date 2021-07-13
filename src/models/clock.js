import SignalManager from '@/models/signal-manager'
import { ATU_BETWEEN_UPDATE } from '@/globals'

/**
 * Gestionnaire du temps dans l'architecture.
 *
 * Nous notons le temps en UTA (Unité de Temps de l'Architecture).
 * Lors du lancement de l'application, cette horloge va tourner, envoyant une
 * update toutes les x UTA.
 *
 * Pour avoir une méthode ou une fonction qui est appelée à chaque update, il
 * faut appeler la méthode register avec comme paramètre, le nom de la
 * callback :
 *
 * ```js
 * Clock.register('myUpdateFunction')
 * ```
 *
 * La méthode peut prendre jusqu'à deux arguments :
 *  - Le premier est le nombre de UTA passées depuis la dernière update. Cette
 *    valeur est souvent la même, mais il se peut qu'elle soit parfois
 *    différente.
 *  - Le second est un tableau représentant tous les signaux de l'architecture.
 *    Les clés sont les signaux (voir `SignalManager`) est les valeurs
 *    représentent le temps restant avant que le signal n'arrête son émission.
 *    Lorsque la valeur est 0, cela signifie que le signal est éteint.
 *
 * ```js
 * myUpdateFunction(ATU, signals) {
 *     console.log(`${ATU} UTA sont passées depuis la dernière update`)
 *     for (const signal of signals) {
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
    updateCallbacks // Array
    totalATU // Number
    prevATU // Number

    constructor() {
        console.log('clock constructed')
        this.totalATU = 0
        this.prevATU = 0
        this.updateCallbacks = []
    }

    /**
     * Cette méthode doit être appelée pour ajouter une fonction/méthode à
     * appeler à chaque update.
     *
     * @param {Callback} callback méthode qui sera appelée toutes les 1 UTA
     */
    register(callback) {
        this.updateCallbacks.push(callback)
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
        this.totalATU += ATU
    }

    /**
     * Attend et fait une update toutes les tickDiff UTA
     * Une dernière update est faite à la fin s'il reste du temps d'attente
     *
     * @param {Number} ATU Le temps d'attente
     * @param {Number} tickDiff Le temps entre 2 updates
     */
    waitAndTick(ATU, tickDiff = ATU_BETWEEN_UPDATE) {
        while (ATU > tickDiff) {
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
