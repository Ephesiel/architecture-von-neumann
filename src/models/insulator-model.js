import Clock from '@/models/clock'
import { int } from '@/integer'

/**
 * Un isolateur choisi si une valeur est passée ou non dans un bus.
 *
 * L'isolateur est souvent entre deux bus, et il sert à savoir si l'information
 * peut être transférée de l'un à l'autre. Pour ce faire, il se sert d'un
 * signal qui va lui indiquer si oui ou non il peut, électroniquement parlant,
 * faire passer le courant.
 *
 * Lorsque le courant passe, il va transmettre sa valeur stockée au bus de
 * sortie. Exemple :
 *
 * ```js
 * const outputBus = new Bus()
 * const insulator = new Insulator(outputBus, signals.SIG)
 * insulator.value = 42
 *
 * console.log(outputBus.hasPower(), outputBus.value) // => (false, 0)
 *
 * SignalsManager.emit(signals.SIG, 1)
 *
 * console.log(outputBus.hasPower(), outputBus.value) // => (true, 42)
 * ```
 */
export default class Insulator {
    // ------------------------------------------------------------------------
    // Attributs.
    value //: Integer
    outputBus //: Bus
    powerOnSignal //: Signal

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(outputBus, powerOnSignal) {
        Clock.register(this.update.bind(this))

        this.value = int(0)
        this.outputBus = outputBus
        this.powerOnSignal = powerOnSignal
    }

    // ------------------------------------------------------------------------
    // Méthodes publiques.

    update(_, signals) {
        if (signals[this.powerOnSignal] > 0) {
            this.outputBus.setValue(this.value)
        }
    }

    setValue(value) {
        this.value = value
    }
}
