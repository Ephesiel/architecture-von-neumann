import {
    NB_BITS_ADR,
    NB_BITS_CONDS,
    NB_BITS_SELMS,
    NB_BITS_MPM,
} from '@/globals'
import { PulseSignals, LevelSignals } from '@/signals'

class MicroprogrammedMemoryParser {
    /**
     *
     * @param {Number} nextAddr, doit être inferieur à 2^NB_BITS_ADDRESSES
     * @param {Number} selMS, doit être entre 0 et 3 (inclus)
     * @param {Number} cond, doit être entre 0 et 15 (inclus)
     * @param {Array} signals, un tableau avec les signaux
     */
    parse(nextAddr, selMS, cond, signals) {
        let value = BigInt(nextAddr)
        value = (value << BigInt(NB_BITS_SELMS)) | BigInt(selMS)
        value = (value << BigInt(NB_BITS_CONDS)) | BigInt(cond)

        let totalBits = NB_BITS_ADR + NB_BITS_SELMS + NB_BITS_CONDS
        const watchedSignals = {
            ...PulseSignals,
            ...LevelSignals,
        }
        for (const val of Object.values(watchedSignals)) {
            value <<= 1n
            if (signals.includes(val)) {
                value |= 1n
            }
            totalBits += 1
        }

        value <<= BigInt(NB_BITS_MPM - totalBits)

        return value
    }
}

export default new MicroprogrammedMemoryParser()
