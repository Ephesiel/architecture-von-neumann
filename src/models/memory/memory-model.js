import Debug from '@/debug'
import Integer, { uint, int } from '@/integer'
//import { NB_BITS_ARCH } from '@/globals'

/**
 * La mémoire est un tableau ayant 2^n entrées. Chacune est référencée par une
 * adresse qui est l'index du tableau.
 *
 * Les valeurs de la mémoire sont instanciées à null par défaut et essayer de
 * récupérer une valeur non instanciée engendrera un warning.
 *
 * Un objet mémoire doit connaître :
 *  - sa largeur : la taille en bits d'une valeur de la mémoire
 *  - sa hauteur : le nombre d'adresses disponibles
 *
 * Il est souvent logique que la hauteur (son log) soit plus petite que la
 * largeur, car souvent, des adresses d'une mémoire sont stockées à l'intérieur
 * de celle ci. C'est ce qu'on appelle des pointeurs.
 *
 * En réalité, on donnera le log de la hauteur en paramètre, permettant de
 * créer 2^n adresses.
 *
 * Exemple :
 *
 * ```js
 * // Adresses sur 4 bits, Valeur sur 10 bits
 * let memory = new Memory(4, 10)
 *
 * // Ok
 * memory.setValue(8, 500)
 *
 * // Ok
 * memory.getValue(8)
 *
 * // Erreur, les valeurs doivent être entre 0 et 1023
 * memory.setValue(8, 1050)
 *
 * // Erreur, les adresses sont entre 0 et 15
 * memory.getValue(20)
 * ```
 */
export default class Memory {
    // ------------------------------------------------------------------------
    // Attributs.
    maxValue //: Integer
    memory //: Array

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(logHeight, width) {
        this.maxValue = uint(0, width).not()
        this.memory = new Array(2 ** logHeight).fill(null)
    }

    // ------------------------------------------------------------------------
    // Méthodes publiques.

    /**
     * Renvoie la valeur de la mémoire à l'adresse donnée
     *
     * Si l'adresse est trop grande ou si elle n'a jamais été instanciée,
     * renvoie un nombre aléatoire
     *
     * @param {Integer} address L'adresse où récupérer une valeur
     */
    getValue(address) {
        const value = this.memory[address.toNumber()]

        // Bonne valeur
        if (value instanceof Integer) {
            return value
        }

        // Adresse hors de la mémoire
        if (typeof value === 'undefined') {
            Debug.crit(`L'adresse ${address} n'existe pas dans la mémoire`)
        }
        // La valeur n'a jamais été instanciée
        else {
            Debug.warn(
                `Le contenu de l'adresse ${address} n'a jamais été donné, le` +
                    `résultat renvoyé est non défini`
            )
        }

        // Renvoie 0 par défaut
        return int(0)
    }

    /**
     * Ecrit une valeur dans la mémoire
     *
     * L'adresse doit être dans la mémoire et la valeur doit être une valeur
     * possible (pas trop grande)
     *
     * @param {Integer} address L'adresse où mettre la valeur
     * @param {Integer} value La valeur à mettre dans la mémoirie
     */
    setValue(address, value) {
        if (!(address in this.memory)) {
            Debug.crit(`L'adresse ${address} n'existe pas dans la mémoire`)
            return
        }

        if (!(value instanceof Integer)) {
            Debug.crit(
                'La valeur à affecter à une mémoire doit être un nombre.'
            )
            return
        }

        if (value.toBigInt() > this.maxValue.toBigInt()) {
            Debug.crit('Nombre trop grand pour cette mémoire')
            return
        }

        this.memory[address.toNumber()] = value
    }
}
