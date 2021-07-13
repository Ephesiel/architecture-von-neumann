import RegisterDecorator from '@/models/registers/register-decorator'
import Insulator from '@/models/insulator-model'

/**
 * Composant du décorateur qui ajoute des isolateurs en sortie à la place des
 * bus.
 *
 * En effet, un registre à bascule SISO peut avoir une ou plusieurs sorties. Il
 * peut envoyer sa valeur a ses bus de sortie en continu, ou bien, comme dans
 * ce cas, vouloir gérer quand est-ce que les bus peuvent prendre la valeur de
 * ce registre.
 *
 * Ainsi, les isolateurs ont besoin de signaux pour "laisser passer" la valeur
 * que leur envoie le registre. Il faut donc utiliser les services proposés par
 * nos fonctions `Helper` pour créer des objets du type reconnu par le
 * composant. Exemple :
 * ```js
 * const [bus1, bus2, bus3, bus4] = [new Bus(), new Bus(), new Bus(), new Bus()]
 * const registreA = new InsulatorComponent(new Register({
 *      Helper.makeRObj(bus1, signals.eSIG1),
 *      Helper.makeRObj(bus2, signals.eSIG2)
 *  }, {
 *      Helper.makeRObj(bus3, signals.SIG1),
 *      Helper.makeRObj(bus4, signals.SIG2)
 * }, Signals.SIG3)),
 * ```
 * Ici, les isolateurs laisseront passer le courant quand les signaux `SIG1` ou
 * `SIG2` seront déclenchés.
 */
export default class InsulatorComponent extends RegisterDecorator {
    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(register) {
        super(register)

        this.modifyRegisterOutputsToInsulators()
    }

    // ------------------------------------------------------------------------
    // Méthodes utilisées par la classe.

    modifyRegisterOutputsToInsulators() {
        const outputBuses = this.register.getOutputs()
        const outputs = []

        for (const outputBus of outputBuses) {
            const bus = outputBus.bus
            const sig = outputBus.signal

            outputs.push(new Insulator(bus, sig))
        }

        this.register.setOutputs(outputs)
    }
}
