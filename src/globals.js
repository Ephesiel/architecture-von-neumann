import signals from '@/signals'
import { uint, int } from '@/integer'
import MMParser from '@/microprogrammed-memory-parser'

import {
    NB_BITS_ARCH,
    NB_BITS_COPMA,
    NB_BITS_ADR,
    NB_BITS_SELMS,
    NB_BITS_CONDS,
    NB_BITS_INSTR,
    MPM_BITS_ADDRESSES,
    NB_BITS_ADDRESSES,
} from '@/constants'

export const Signals = signals
export {
    MAXIMUM_ALLOWED_BUS_POWER_TIME,
    ATU_BETWEEN_UPDATE,
    TIME_ATU_FOR_LEVELS,
    TIME_ATU_FOR_PULSES,
} from '@/constants'
export {
    NB_BITS_ARCH,
    NB_BITS_COPMA,
    NB_BITS_ADR,
    NB_BITS_SELMS,
    NB_BITS_CONDS,
    NB_BITS_INSTR,
    MPM_BITS_ADDRESSES,
    NB_BITS_ADDRESSES,
}

export const NB_BITS_RA = NB_BITS_ARCH - NB_BITS_COPMA // Ne pas modifier
export const NB_BITS_MPM =
    NB_BITS_ADR + NB_BITS_SELMS + NB_BITS_CONDS + NB_BITS_INSTR // Ne pas modifier

export const FETCH_PHASE1_ADDR = uint(2 ** MPM_BITS_ADDRESSES - 3) // Ne pas modifier
export const MAX_NUMBER_OF_ARCH = uint(0).not() // Ne pas modifier
export const MIN_RA = int(1, NB_BITS_RA).leftShift(NB_BITS_RA - 1) // Ne pas modifier
export const MAX_RA = MIN_RA.sub(1) // Ne pas modifier
export const MAX_ADDR = uint(0, NB_BITS_ADDRESSES).not()

export const FETCH_PHI1 = MMParser.parse(0, 0, 0, [
    signals.COB1,
    signals.XS,
    signals.eRAM,
])
export const FETCH_PHI2 = MMParser.parse(0, 0, 0, [signals.sM])
export const FETCH_PHI3 = MMParser.parse(0, 2, 0, [
    signals.REB1,
    signals.XS,
    signals.eRI,
])
