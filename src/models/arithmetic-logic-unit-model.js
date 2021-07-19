import SignalManager from '@/models/signal-manager'
import Clock from '@/models/clock'
import Debug from '@/debug'

/**
 * Représente l'unité arithmétique et logique de l'architecture (UAL).
 *
 * L'UAL prend un certain nombre de bus d'entrée et de sortie. Il est également
 * possible (et même recommandé sinon elle est inutile) de lui ajouter des
 * opérations.
 *
 * Ces opérations peuvent être ajoutées dynamiquement. Pour ce faire, il suffit
 * d'appeler la méthode `addOperation` avec en arguments le signal de
 * l'opération et la-dite opération.
 *
 * La valeur des bus de l'architecture étant gérée à travers des `BigInt`, il
 * est important de noter que les opérations doivent se faire sur des `BigInt`
 * et non sur des entiers normaux.
 *
 * Voici un exemple d'une opération "+1" et d'une opération "ADD" ajoutées à
 * une UAL fraichement créée. Cette UAL possèdant deux bus d'entrée :
 *
 * ```js
 * // Bus d'entrées
 * const busX = new Bus()
 * const busY = new Bus()
 *
 * // Bus unique de sortie
 * const outputBus = new Bus()
 *
 * const ALU = new ArithmeticLogicUnit([busX, busY], [outputBus])
 *
 * // Opération "+1"
 * ALU.addOperation(Signals.PLUS1, (x) => {
 *     return x + 1n // <- BigInt, d'où le "1n"
 * })
 *
 * // Opération "ADD"
 * ALU.addOperation(Signals.ADD, (x, y) => {
 *     return x + y
 * })
 * ```
 */
export default class ArithmeticLogicUnit {
    // ------------------------------------------------------------------------
    // Attributs.
    operations //: Object
    inputBuses //: Array
    outputBuses //: Array

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(inputBuses, outputBuses) {
        this.inputBuses = inputBuses
        this.outputBuses = outputBuses
        this.operations = {}

        Clock.register(this.update.bind(this))
    }

    // ------------------------------------------------------------------------
    // Méthodes publiques.

    /**
     * A chaque update, on vérifie si un signal d'opération a été envoyé.
     * Si c'est le cas, on envoie la valeur de l'op dans les bus de sortie
     */
    update(UTA, signals) {
        let op = 0

        for (const [signal, operation] of Object.entries(this.operations)) {
            if (signals[signal]) {
                if (++op === 2) {
                    Debug.crit(
                        "Plusieurs signaux d'opérations ont été envoyés simultanément"
                    )
                }

                const toSet = operation(
                    ...this.inputBuses.map((bus) => bus.getValue())
                )

                for (const bus of this.outputBuses) {
                    bus.setValue(toSet)
                }
            }
        }
    }

    /**
     * Permet d'ajouter une opération à l'ALU.
     *
     * Le premier paramètre est le signal qui sera envoyé à l'ALU. Lorsque le
     * signal correspondant à l'opération sera envoyé, le bus de sortie
     * s'activera avec la valeur renvoyée par l'opération concernée
     *
     * Le deuxième paramètre, c'est une callback représentant l'opération à
     * effectuer. Elle peut prendre jusque n entiers en paramètres et doit
     * renvoyer un entier. n étant le nombre de bus d'entrée.
     * Attention, tous les entiers sont des `BigInt`. Ainsi, il ne faut pas
     * oublier de les traiter comme tel (x + 1n par exemple pour ajouter 1 à
     * x).
     *
     * @param {Signal} signal Le signal décrivant l'opération
     * @param {Callback} callback L'opération à effectuer
     */
    addOperation(signal, callback) {
        if (SignalManager.signalExists(signal)) {
            if (typeof this.operations[signal] !== 'undefined') {
                Debug.warn(
                    `L'opération ${signal} existait déjà et a été surchargée`
                )
            }
            this.operations[signal] = callback
        }
    }
}
