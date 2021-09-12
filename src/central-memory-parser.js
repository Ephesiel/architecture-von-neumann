import {
    NB_BITS_ARCH,
    NB_BITS_COPMA,
    NB_BITS_RA,
    NB_BITS_ADDRESSES,
} from '@/globals'
import instructions from '@/instructions.json'
import { int, uint } from '@/integer'

class CentralMemoryParser {
    /**
     *
     * @param {Number} COPMA, doit être inferieur à 2^NB_BITS_COPMA
     * @param {Number} RA, doit être entre 0 et 2^NB_BITS_RA
     */
    parse(COPMA, RA) {
        // Création d'un entier sur le nombre de bits de la mémoire centrale.
        const copma = uint(COPMA, NB_BITS_ARCH)
        const ra = int(RA, NB_BITS_RA)
        const value = copma.leftShift(NB_BITS_RA).add(ra)
        return value
    }

    /**
     *
     * @param {Number} addr, doit être entre 0 et 2^NB_BITS_ADDRESSES
     */
    parseAddress(addr) {
        return uint(addr, NB_BITS_ADDRESSES)
    }

    /**
     *
     */
    translate(integer) {
        const COPMA = integer.rightShift(NB_BITS_RA).toNumber()
        const RA = integer.leftShift(NB_BITS_COPMA).rightShift(NB_BITS_COPMA)

        if (COPMA === 0) {
            return `${RA}`
        }

        for (const [copma, instruction] of Object.entries(instructions)) {
            if (parseInt(copma) === COPMA) {
                return `${instruction.COP} ${instruction.MA} ${RA}`
            }
        }

        return `${integer.toNumber()}`
    }
}

export default new CentralMemoryParser()
