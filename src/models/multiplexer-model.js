import Clock from '@/models/clock'
import Debug from '@/debug'
import { uint } from '@/integer'

/**
 * Implémentation d'un multiplexeur.
 *
 * Un multiplexeur est un circuit qui permet de choisir la valeur du bus
 * d'entrée qui sera envoyé sur le bus de sortie.
 *
 * Il possède un bus de sélection, de n bits, et 2^n bus d'entrées. S'il y a
 * moins de 2^n bus d'entrée, un avertissement sera envoyé, car le multiplexeur
 * pourra potentiellement essayer de prendre la valeur d'un bus qui n'existe
 * pas, ce qui entrainera une erreur.
 *
 * S'il possède plus de 2^n bus d'entrée, alors une erreur critique sera
 * envoyée, car le multiplexeur ne pourra pas être créé. Ainsi, si l'update est
 * appelée de manière forcée, un autre avertissement sera envoyé.
 */
export default class Multiplexer {
    // ------------------------------------------------------------------------
    // Attributs.
    inputs //: Bus[]
    output //: Bus
    selectorBus //: Bus

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(inputs, output, selectorBus) {
        // Correspond à 2^(selectorBus.getValue().getSize())
        const nbMaxInputs = uint(
            1,
            selectorBus.getValue().getSize() + 1
        ).leftShift(selectorBus.getValue().getSize())
        if (nbMaxInputs.gt(inputs.length)) {
            Debug.warn(
                "Le nombre de bus d'entrée est inférieur au nombre de " +
                    'possibilités du bus sélecteur.'
            )
        } else if (nbMaxInputs.lt(inputs.length)) {
            Debug.crit(
                "Le nombre de bus d'entrée est supérieur au nombre maximum " +
                    "de possibilités du bus sélecteur. Le multiplexeur n'a " +
                    'pas été créé.'
            )
            return
        }

        Clock.register(this)

        this.inputs = inputs
        this.output = output
        this.selectorBus = selectorBus
    }

    // ------------------------------------------------------------------------
    // Méthode publique.

    update() {
        if (
            typeof this.inputs === 'undefined' ||
            typeof this.output === 'undefined' ||
            typeof this.selectorBus === 'undefined'
        ) {
            Debug.warn("Appel d'update() avec un multiplexeur non instancié.")
            return
        }

        this.output.setValue(
            this.inputs[this.selectorBus.getValue().toNumber()].getValue()
        )
    }
}
