import signals from '@/signals'

export const Signals = signals
export const MAXIMUM_ALLOWED_BUS_POWER_TIME = 5 // Un bus aura du courant pendant 5 ATU une fois qu'il a été activé.
export const ATU_BETWEEN_UPDATE = 1 // Fréquence d'appel aux méthodes "update".
export const NB_BITS_ARCH = 32 // Nombre de bits maximum pour les bus et les registres de l'architecture. Ne doit pas dépasser 64.
export const NB_BITS_ADR = 10 // Nombre de bits de l'adresse suivante
export const NB_BITS_SELMS = 2 // Nombre de bits du selMS
export const NB_BITS_CONDS = 4 // Au maximum 16 conditions
export const NB_BITS_INSTR = 48 // 48 signaux différents au max
export const NB_BITS_COPMA = 8 // Nombre de bits sur lesquels sont encodés COPMA

export const NB_BITS_RA = NB_BITS_ARCH - NB_BITS_COPMA
export const NB_BITS_MPM =
    NB_BITS_ADR + NB_BITS_SELMS + NB_BITS_CONDS + NB_BITS_INSTR // Ne pas modifier
export const MAX_NUMBER_OF_ARCH = BigInt(Math.pow(2, NB_BITS_ARCH)) - 1n // Ne pas modifier
