import Clock from '@/clock'

/**
 * Classe gérant la lecture d'une mémoire.
 *
 * Pour lire la mémoire, il faut connaître l'adresse à lire et renvoyer la
 * valeur de la mémoire à l'adresse donnée.
 *
 * Pour ce faire, il faut connaître un bus d'entrée (l'adresse à lire) et un
 * bus de sortie (la valeur à renvoyer).
 *
 * Enfin, il faut également connaître le signal qui permettra de lancer le
 * processus.
 */
export default class MemoryReader {
    memory //: Memory
    readSignal //: Signal
    inputBus //: Bus
    outputBus //: Bus

    constructor(memory, readSignal, inputBus, outputBus) {
        this.memory = memory
        this.readSignal = readSignal
        this.inputBus = inputBus
        this.outputBus = outputBus

        Clock.register(this.update.bind(this))
    }

    update(ATU, signals) {
        if (signals[this.readSignal]) {
            this.outputBus.setValue(
                this.memory.getValue(this.inputBus.getValue())
            )
        }
    }
}
