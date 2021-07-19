import Clock from '@/models/clock'

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
    addressBus //: Bus
    valueBus //: Bus

    constructor(memory, readSignal, addressBus, valueBus) {
        this.memory = memory
        this.readSignal = readSignal
        this.addressBus = addressBus
        this.valueBus = valueBus

        Clock.register(this.update.bind(this))
    }

    update(ATU, signals) {
        if (signals[this.readSignal]) {
            this.valueBus.setValue(
                this.memory.getValue(this.addressBus.getValue())
            )
        }
    }
}
