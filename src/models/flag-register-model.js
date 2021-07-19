import Clock from '@/models/clock'
import Debug from '@/debug'

/**
 * Implémentation du registre de flags.
 *
 * Le registre de flags gère les conditions de l'architecture. Son bus d'entrée
 * est connecté au REMM, et selon la valeur qu'il prend, il envoie la condition
 * à cet indice dans le tableau.
 *
 * Son bus de sortie est connecté au multiplexeur de conditions du séquenceur.
 * Ce bus doit être d'un seul bit, et ne doit ainsi accepter que les valeurs 0
 * ou 1. En conséquence, les callbacks de conditions doivent aussi retourner
 * seulement 0 ou 1.
 *
 * Une erreur sera déclenchée si la condition n'existe pas (si l'indice de la
 * condition a exécuter est trop grand ou inférieur à 0).
 *
 * Les callbacks ne doivent pas avoir d'arguments. En effet, tout doit être
 * "capturé" dans le scope du callback.
 */
export default class FlagRegister {
    // ------------------------------------------------------------------------
    // Attributs.
    inputBus //: Bus
    outputBus //: Bus
    conditions //: Array of callbacks

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(n, inputBus, outputBus) {
        Clock.register(this.update.bind(this))
        this.conditions = Array(n).fill(() => {
            return 0
        })
        this.inputBus = inputBus
        this.outputBus = outputBus
    }

    // ------------------------------------------------------------------------
    // Méthode publique.

    update() {
        if (this.inputBus.hasPower()) {
            this.outputBus.setValue(this.getCondition(this.inputBus.getValue()))
        }
    }

    // ------------------------------------------------------------------------
    // Méthodes utilisées par la classe.

    setCondition(valCond, callback) {
        if (!(valCond in this.conditions)) {
            Debug.error(
                `L'indice donné (${valCond}) est supérieur au nombre de ` +
                    `conditions maximum ${this.conditions.length} (setCondition).`
            )
            return
        }
        this.conditions[valCond] = callback
    }

    getCondition(index) {
        if (!(index in this.conditions)) {
            Debug.error(
                `L'indice donné (${index}) est supérieur au nombre de ` +
                    `conditions maximum ${this.conditions.length} (getCondition).`
            )
            return 0
        }
        return this.conditions[index]()
    }
}
