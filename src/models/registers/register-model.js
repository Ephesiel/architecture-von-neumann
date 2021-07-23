import Clock from '@/models/clock'
import Debug from '@/debug'
import { int } from '@/integer'

/**
 * Implémentation d'un registre à décalage SISO.
 *
 * Ce type de registre contient deux bascules : une "maître", qui connaît la
 * valeur du registre à l'instant T, et une "esclave", qui contient la valeur
 * que le registre doit prendre à T + 1, c'est à dire au tick d'horloge
 * suivant.
 *
 * Cette classe-ci est la classe mère, et prend seulement des Bus en sortie.
 * Vous noterez que, étant un langage dynamiquement typé, javascript permet
 * aussi de donner un tableau d'isolateurs :
 * ```js
 * const [bus1, bus2, bus3, bus4] = [new Bus(), new Bus(), new Bus(), new Bus()]
 * const registreA = new Register({
 *      Helper.makeRObj(signals.eSIG1, bus1),
 *      Helper.makeRObj(signals.eSIG2, bus2)
 *  }, [
 *      new Insulator(bus3, signals.SIG1),
 *      new Insulator(bus4, signals.SIG2),
 * ], Signals.SIG3)
 * ```
 * Cependant, cette écriture n'étant pas très claire, il vaut mieux l'éviter et
 * utiliser le décorateur prévu à cet effet, qui instancie directement les
 * isolateurs grâce à ses bus de sortie :
 * ```js
 * const [bus1, bus2, bus3, bus4] = [new Bus(), new Bus(), new Bus(), new Bus()]
 * const registreA = new InsulatorRegister({
 *      Helper.makeRObj(bus1, signals.eSIG1),
 *      Helper.makeRObj(bus2, signals.eSIG2)
 *  }, {
 *      Helper.makeRObj(bus3, signals.SIG1),
 *      Helper.makeRObj(bus4, signals.SIG2)
 * }, Signals.SIG3),
 * ```
 * Bien sûr, un registre peut nourrir en continu un (/ des) bus, sans avoir
 * besoin de signal. Dans ce cas, il suffit de créer un objet sans signal avec
 * `Helper.makeRObj(monBus)`, le signal n'est pas un paramètre obligatoire.
 *
 * Cependant, un bus d'entrée doit **toujours** avoir un signal, car un bus ne
 * peut pas nourrir en continu un registre !
 *
 * Discriminants pour les classe filles :
 *   * Présence d'isolateur,
 *   * Signal du tick horloge utilisé par le registre.
 */
export default class Register {
    // ------------------------------------------------------------------------
    // Attributs.
    inputs //: []Object{signal, bus}
    outputs //: []Bus
    currentValue //: Integer
    nextValue //: Integer
    signalClockTick //: Signal
    name //: String

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(name, inputs, outputs, signalClockTick) {
        Clock.register(this)

        this.inputs = inputs
        this.outputs = outputs
        this.signalClockTick = signalClockTick
        this.currentValue = int(0)
        this.nextValue = int(0)
        this.name = name
    }

    // ------------------------------------------------------------------------
    // Méthodes publiques.

    update(_, signals) {
        if (signals[this.signalClockTick] > 0) {
            this.currentValue = this.nextValue
        }

        let alreadyModified = false
        for (const inputObj of this.inputs) {
            const input = inputObj.bus
            const signal = inputObj.signal

            alreadyModified = this.tryValueUpdate(
                input,
                signal,
                alreadyModified,
                signals
            )
        }

        this.setOutputValue()
    }

    // ------------------------------------------------------------------------
    // Méthodes virtuelles.

    /**
     * Passe la valeur de toutes les sorties à `value`. Cette méthode peut être
     * réécrite dans les classes filles pour adapter le corps de la méthode.
     */
    setOutputValue() {
        for (const output of this.outputs) {
            output.setValue(this.currentValue)
        }
    }

    // ------------------------------------------------------------------------
    // Méthodes utilisées par la classe.

    /**
     * Mets à jour la valeur T+1 du registre si le bus est sous tension et que
     * le signal d'entrée est trigger.
     *
     * Tire une exception si 2 bus essaient de modifier le registre.
     *
     * @param {Bus} input
     * @param {Signal} signal
     * @param {Boolean} alreadyModified
     * @param {Signal[]} signals
     *
     * @returns {Boolean} Si oui ou non la valeur T+1 a été modifiée.
     */
    tryValueUpdate(input, signal, alreadyModified, signals) {
        if (typeof signal === 'undefined' || signals[signal] > 0) {
            if (alreadyModified) {
                Debug.error(
                    'Erreur: 2 bus essaient de modifier le même registre.'
                )
                return
            }
            alreadyModified = true
            this.nextValue = input.getValue()
        }

        return alreadyModified
    }

    setOutputs(outputs) {
        this.outputs = outputs
    }

    setSignalClockTick(signalClockTick) {
        this.signalClockTick = signalClockTick
    }

    getCurrentValue() {
        return this.currentValue
    }

    getNextValue() {
        return this.nextValue
    }

    getOutputs() {
        return this.outputs
    }

    getName() {
        return this.name
    }
}
