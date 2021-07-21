import {
    NB_BITS_ADR,
    NB_BITS_CONDS,
    NB_BITS_SELMS,
    NB_BITS_MPM,
} from '@/globals'
import { PulseSignals, LevelSignals } from '@/signals'
import { uint } from '@/integer'

class MicroprogrammedMemoryParser {
    /**
     *
     * @param {Number} nextAddr, doit être inferieur à 2^NB_BITS_ADDRESSES
     * @param {Number} selMS, doit être entre 0 et 3 (inclus)
     * @param {Number} cond, doit être entre 0 et 15 (inclus)
     * @param {Array} signals, un tableau avec les signaux
     */
    parse(nextAddr, selMS, cond, signals) {
        // Création d'un entier sur le nombre de bits de la mémoire de
        // microprogrammation.
        let value = uint(nextAddr, NB_BITS_MPM)
        value = value.leftShift(NB_BITS_SELMS).add(selMS)
        value = value.leftShift(NB_BITS_CONDS).add(cond)

        let totalBits = NB_BITS_ADR + NB_BITS_SELMS + NB_BITS_CONDS
        const watchedSignals = {
            ...PulseSignals,
            ...LevelSignals,
        }
        for (const val of Object.values(watchedSignals)) {
            value = value.leftShift(1)
            if (signals.includes(val)) {
                value = value.add(1)
            }
            totalBits += 1
        }

        value = value.leftShift(NB_BITS_MPM - totalBits)

        return value
    }
}

export default new MicroprogrammedMemoryParser()
