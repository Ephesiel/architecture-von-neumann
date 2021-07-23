import Clock from '@/models/clock.js'

/**
 * Implémentation du composant du séquenceur Plus1.
 *
 * Ce composant prend la sortie du registre d'accès à la mémoire de
 * microprogrammation et lui ajoute 1, pour ensuite réinjecter cette valeur
 * dans le multiplexeur dédié.
 */
export default class Plus1 {
    // ------------------------------------------------------------------------
    // Attributs.
    input //: Bus
    output //: Bus

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(input, output) {
        Clock.register(this)

        this.input = input
        this.output = output
    }

    // ------------------------------------------------------------------------
    // Méthodes publiques.

    update() {
        this.output.setValue(this.input.getValue().add(1))
    }
}
