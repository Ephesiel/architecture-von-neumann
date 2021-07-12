import { MAXIMUM_ALLOWED_BUS_POWER_TIME } from '@/globals.js'
import Clock from '@/models/clock'

/**
 * Représentation abstraite d'un bus de données.
 *
 * Un bus de données permet le transfert de données entre deux composants de
 * l'architecture. Il est ici représenté grâce, notamment, à deux attributs :
 *   * La valeur, qui donne la valeur qui est transférée dans le bus.
 *   * Le courant, qui informe si un composant a transféré des données dans le
 *     bus durant les derniers instants (en Unité de Temps d'Architecture).
 *
 * Si un bus n'a plus de courant, sa valeur deviendra 0. C'est un choix que
 * nous avons prit pour essayer de garder une représentation (informatique)
 * consistante avec la réalité (électronique).
 * Il est donc fortemment recommandé, avant chaque récupération de la valeur du
 * bus, de vérifier si celui-ci est sous tension ou non (grâce à la méthode
 * hasPower()).
 *
 * ```js
 * // `entries` est une liste de bus.
 * for (const entry of this.entries) {
 *     if (entry.hasPower()) {
 *         this.value = entry.value
 *     }
 * }
 * ```
 * Vous serez sans doute tenté d'utiliser `bus.value = ...` pour écrire une
 * valeur dans le bus, mais ce comportement est à proscrire. En effet, une
 * couche d'abstraction a été rajoutée pour gérer discrètement les mécanismes
 * internes d'un Bus, et il faut donc absolument passer par `setValue()`.
 */
export default class Bus {
    // ------------------------------------------------------------------------
    // Attributs.
    value //: Number
    timeSinceLastModification //: Number
    power //: Boolean

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor() {
        Clock.register(this.update.bind(this))

        this.value = 0
        this.timeSinceLastModification = 0
        this.power = false
    }

    // ------------------------------------------------------------------------
    // Méthodes publiques.

    setValue(val) {
        this.value = Number(val)
        this.timeSinceLastModification = 0
        this.power = true
    }

    hasPower() {
        return this.power === true
    }

    update(ATU) {
        this.timeSinceLastModification += Number(ATU)
        if (this.timeSinceLastModification > MAXIMUM_ALLOWED_BUS_POWER_TIME) {
            this.power = false
            this.value = 0
        }
    }
}
