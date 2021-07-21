import signals from '@/signals'
import MMParser from '@/microprogrammed-memory-parser'
import { uint } from '@/integer'

export const Signals = signals
export const MAXIMUM_ALLOWED_BUS_POWER_TIME = 5 // Un bus aura du courant pendant 5 ATU une fois qu'il a été activé.
export const ATU_BETWEEN_UPDATE = 1 // Fréquence d'appel aux méthodes "update".
export const NB_BITS_ARCH = 32 // Nombre de bits maximum pour les bus et les registres de l'architecture. Ne doit pas dépasser 64.
export const NB_BITS_ADR = 10 // Nombre de bits de l'adresse suivante
export const NB_BITS_SELMS = 2 // Nombre de bits du selMS
export const NB_BITS_CONDS = 4 // Au maximum 16 conditions
export const NB_BITS_INSTR = 48 // 48 signaux différents au max
export const NB_BITS_COPMA = 8 // Nombre de bits sur lesquels sont encodés COPMA
export const MPM_BITS_ADDRESSES = 10 // 2^10 adresses dans la mémoire microprogrammée
export const TIME_ATU_FOR_LEVELS = 5 // Temps d'émission des signaux de niveaux
export const TIME_ATU_FOR_PULSES = 1 // Temps d'émission des signaux d'impulsion
export const NB_BITS_ADDRESSES = 10 // 2^10 adresses dans la mémoire

export const FETCH_PHASE1_ADDR = uint(2 ** MPM_BITS_ADDRESSES - 3) // Ne pas modifier
export const NB_BITS_RA = NB_BITS_ARCH - NB_BITS_COPMA
export const NB_BITS_MPM =
    NB_BITS_ADR + NB_BITS_SELMS + NB_BITS_CONDS + NB_BITS_INSTR // Ne pas modifier
export const MAX_NUMBER_OF_ARCH = uint(0, NB_BITS_ARCH).not() // Ne pas modifier
export const FETCH_PHI1 = MMParser.parse(0, 0, 0, [
    signals.COB1,
    signals.XS,
    signals.eRAM,
])
export const FETCH_PHI2 = MMParser.parse(0, 0, 0, [Signals.sM])
export const FETCH_PHI3 = MMParser.parse(0, 2, 0, [
    signals.REB1,
    signals.XS,
    signals.eRI,
])
