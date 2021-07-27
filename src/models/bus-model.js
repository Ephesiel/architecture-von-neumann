import { MAXIMUM_ALLOWED_BUS_POWER_TIME, NB_BITS_ARCH } from '@/globals.js'
import Clock from '@/models/clock'
import Debug from '@/debug'
import Integer, { UNSIGNED, SIGNED, int, maxOf } from '@/integer'

/**
 * Représentation abstraite d'un bus de données.
 *
 * Un bus de données permet le transfert de données entre deux composants de
 * l'architecture. Il est ici représenté grâce, notamment, à deux attributs :
 *   * La valeur, qui donne la valeur qui est transférée dans le bus.
 *   * Le courant, qui informe si un composant a transféré des données dans le
 *     bus durant les derniers instants (en Unité de Temps d'Architecture).
 *
 * Le bus est composé de n bits. L'utilisateur peut définir le nombre de bits
 * d'un bus lors de la construction de celui-ci. Par défaut, un bus est composé
 * de NB_BITS_ARCH bits. Sa capacité ne peut pas dépasser 2^n - 1. Une erreur
 * sera déclenchée si la valeur entrée est supérieure.
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
    name //: String
    value //: Integer
    defaultValue //: Integer
    timeSinceLastModification //: Number
    power //: Boolean

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(name = '', bits = NB_BITS_ARCH, signed = SIGNED) {
        Clock.register(this)

        this.name = name
        this.value = int(0, bits, signed)
        this.defaultValue = this.value.copy()
        this.timeSinceLastModification = 0
        this.power = false
    }

    // ------------------------------------------------------------------------
    // Méthodes publiques.

    /**
     * Affecte la valeur `val` au bus. `val` doit être un `Integer`, et de même
     * signe que la valeur stockée actuellement dans le bus. Sinon, une erreur
     * critique va être envoyée, et la valeur ne sera pas affectée au bus.
     *
     * Pour être précis, une erreur sera envoyée si une des deux valeur est
     * `unsigned`, et l'autre négative :
     * ```js
     * const bus = new Bus() // bits = NB_BITS_ARCH, signed = SIGNED
     * const anotherBus = new Bus('', NB_BITS_ARCH, UNSIGNED)
     *
     * bus.setValue(int(-5)) // OK
     * bus.setValue(uint(5)) // OK
     *
     * anotherBus.setValue(uint(5)) // OK
     * anotherBus.setValue(int(5))  // OK
     * anotherBus.setValue(int(-5)) // FAIL
     * ```
     *
     * Pas besoin de se préoccuper de la taille en bits de `val`, si elle ne
     * correspond pas à celle du bus, alors elle sera automatiquement adaptée,
     * en réévaluant `val` avec le nombre de bits du bus (et son signe). Si
     * `val` et la valeur réévaluée correspondent, alors il n'y aura pas de
     * problème. Sinon, une erreur sera envoyée.
     *
     * @param {Integer} val
     */
    setValue(val) {
        if (
            !(val instanceof Integer) ||
            (val.isNegative() && this.value.signed === UNSIGNED)
        ) {
            Debug.crit(
                `La valeur à affecter au bus ${this.name} (${val}) doit être un nombre, et doit` +
                    ` être de même signe que la valeur actuelle.`
            )
            return
        }

        // On est obligés de ``parser´´ la valeur envoyée pour garder le même
        // signe.
        const parsedVal = int(val, this.value.getSize(), this.value.signed)

        if (val.getSize() > this.value.getSize() && parsedVal.neq(val)) {
            Debug.crit(
                `Nombre ${val.toString()} trop grand pour le bus ${
                    this.name
                } (qui a pour valeur maximum ${maxOf(
                    this.value.getSize(),
                    this.value.signed
                )})`
            )
            return
        }

        this.value = parsedVal
        this.timeSinceLastModification = 0
        this.power = true
    }

    getValue() {
        return this.value
    }

    hasPower() {
        return this.power === true
    }

    update(ATU) {
        this.timeSinceLastModification += Number(ATU)
        if (this.timeSinceLastModification > MAXIMUM_ALLOWED_BUS_POWER_TIME) {
            this.power = false
            this.value = this.defaultValue
        }
    }
}
