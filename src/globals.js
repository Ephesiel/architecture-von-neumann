import signals from '@/signals'

export const Signals = signals
export const MAXIMUM_ALLOWED_BUS_POWER_TIME = 5 // Un bus aura du courant pendant 5 ATU une fois qu'il a été activé.
export const ATU_BETWEEN_UPDATE = 1 // Fréquence d'appel aux méthodes "update".
export const NB_BITS_ARCH = 32 // Nombre de bits maximum pour les bus et les registres de l'architecture. Ne doit pas dépasser 64.

export const MAX_NUMBER_OF_ARCH = BigInt(Math.pow(2, NB_BITS_ARCH)) - 1n // Ne pas modifier
