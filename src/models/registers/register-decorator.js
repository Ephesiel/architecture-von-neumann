import Register from '@/models/registers/register-model'

/**
 * Implémentation du design pattern Décorateur pour un registre.
 *
 * Le but du décorateur est d'avoir les deux discriminants :
 *   - Les isolateurs
 *   - Les signaux des ticks d'horloge
 *
 * En effet, intégrer ces deux discriminants à l'aide de l'héritage aurait
 * conduit à de la duplication de code (soit du composant de l'isolateur, soit
 * du tick de l'horloge), ce qui n'était pas optimal.
 *
 * Ainsi, cela nous à mené au design pattern décorateur, qui permet de mettre
 * soit un composant, soit l'autre, soit les deux, et c'est exactement ce que
 * nous voulions mettre en place.
 */
export default class RegisterDecorator extends Register {
    // ------------------------------------------------------------------------
    // Attributs.
    register //: Register

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(register) {
        super()
        this.register = register
    }

    update(ATU, signals) {
        this.register.update(ATU, signals)
    }

    getCurrentValue() {
        return this.register.getCurrentValue()
    }

    getNextValue() {
        return this.register.getNextValue()
    }

    setOutputs(outputs) {
        this.register.setOutputs(outputs)
    }

    setSignalClockTick(signalClockTick) {
        this.register.setSignalClockTick(signalClockTick)
    }

    getOutputs() {
        return this.register.getOutputs()
    }
}
