import Clock from '@/clock'

/**
 * Classe gérant l'écriture dans une mémoire.
 *
 * Pour écrire dans la mémoire, il faut connaître l'adresse où écrire et
 * récupérer la valeur à écrire.
 *
 * Pour ce faire, il faut connaître deux bus d'entrée, celui pour connaître
 * l'adress et celui pour connaître la valeur.
 *
 * Enfin, il faut également connaître le signal qui permettra de lancer le
 * processus.
 */
export default class MemoryWriter {
    memory //: Memory
    writeSignal //: Signal
    addressBus //: Bus
    valueBus //: Bus

    constructor(memory, writeSignal, addressBus, valueBus) {
        this.memory = memory
        this.writeSignal = writeSignal
        this.addressBus = addressBus
        this.valueBus = valueBus

        Clock.register(this.update.bind(this))
    }

    update(ATU, signals) {
        if (signals[this.writeSignal]) {
            this.memory.setValue(
                this.addressBus.getValue(),
                this.valueBus.getValue()
            )
        }
    }
}
