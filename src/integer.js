/**
 * Les signaux électrique d'une architecture permettent d'envoyer dans les fils
 * des 0 ou des 1, représentant l'information.
 *
 * Les bus sont une multitude de fils permettant de représenter des mots
 * binaires.
 * Techniquement, il est possible que ces bus puissent prendre un nombre
 * quelconque de fils.
 *
 * L'information est donc représentée sur une quantité de bits non identiques
 * en fonction des différents bus, il peut y avoir 1, 2, 32, 64 bits... De
 * manière générale, il y a souvent une puissance de deux, mais ce n'est pas
 * obligatoire.
 *
 * Il est donc important de connaître l'information de ces bus et de pouvoir la
 * stocker dans notre programme sans trop de mal.
 * C'est à ça que sert cette classe, à stocker un nombre en fonction de sa
 * taille.
 * Il est également possible d'effectuer des opérations élémentaires et de voir
 * les bits tronqués dans le cas où le résultat serait "trop grand", permettant
 * de simuler au mieux l'architecture.
 *
 * Les entiers en javascripts sont trop instables et ne présentent pas bien un
 * nombre. Lorsqu'il est trop grand, le chiffre est déformé.
 *
 * Il existe la possibilité de faire des BigInt pour les grands nombres, mais
 * leur utilisation est fastidieuse et cette classe permet cette utilisation
 * cachée aux yeux des utilisateurs.
 *
 * Le nombre de cette classe est représenté par un tableau de n entier qui sont
 * 0 ou 1 (les bits). Le MSB est le chiffre d'indice n - 1 et le LSB l'indice
 * 0.
 *
 * Les opérations sont toutes créées à la main pour être plus proche des
 * opérations de l'architecture
 */
class Integer {
    // ------------------------------------------------------------------------
    // Attributs.
    bits //: Array de 0 et 1
    size //: Number
    signed //: Boolean

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(value, size, signed = true) {
        size = Number(size)
        if (size <= 0 || isNaN(size)) {
            size = 1
        }
        this.size = size
        this.bits = new Array(size).fill(0)
        this.signed = signed

        if (typeof value === 'number') {
            this.createFromNumber(value)
        } else if (typeof value === 'bigint') {
            this.createFromBigInt(value)
        } else if (value instanceof Integer) {
            this.createFromInteger(value)
        } else if (typeof value === 'string' || Array.isArray(value)) {
            this.createFromIterable(value)
        }
    }

    // ------------------------------------------------------------------------
    // Méthodes utilisées par la classe.

    createFromNumber(n) {
        // Un int est codé en 32 bits en js, donc on s'arrête à 32, on sait
        // qu'il n'y a rien après
        const LSBits = Math.min(this.size, 32)
        const isNegative = n < 0 && this.signed

        // Valeur absolue
        if (isNegative) {
            n = -n
        }

        for (let i = 0; i < LSBits; ++i) {
            this.bits[i] = (n & (1 << i)) >> i
        }

        // On transforme en nombre négatif
        if (isNegative) {
            this.bits = this.twosComplement()
        }
    }

    createFromBigInt(n) {
        // Uniquement des bigint peuvent faire des opérations avec des bigint
        const size = BigInt(this.size)
        const isNegative = n < 0n && this.signed

        // Valeur absolue
        if (isNegative) {
            n = -n
        }

        for (let i = 0n; i < size; ++i) {
            this.bits[Number(i)] = Number((n & (1n << i)) >> i)
        }

        // On transforme en nombre négatif
        if (isNegative) {
            this.bits = this.twosComplement()
        }
    }

    createFromInteger(n) {
        const minSize = Math.min(this.size, n.size)

        for (let i = 0; i < minSize; ++i) {
            this.bits[i] = n.bits[i]
        }
    }

    createFromIterable(n) {
        // On considère que le tableau a été écrit en mode lecture et doit donc
        // être retournée pour coller avec la gestion des bits dans la classe
        const minSize = Math.min(this.size, n.length)

        for (let i = 0; i < minSize; ++i) {
            // On ne veut que des 0 et des 1
            this.bits[i] = Number(n[n.length - i - 1]) === 0 ? 0 : 1
        }
    }

    /**
     * Renvoie l'inversion des bits pour complément à deux
     */
    twosComplement() {
        // On cherche le premier LSB qui vaut 1 et on inverse tous les autres
        // bits qui sont plus significatifs.
        let firstOne = false
        let bits = [...this.bits]

        for (let i = 0; i < this.size; ++i) {
            if (firstOne) {
                bits[i] = bits[i] === 1 ? 0 : 1
            } else {
                firstOne = bits[i] == 1
            }
        }

        return bits
    }

    // ------------------------------------------------------------------------
    // Méthode publique.

    getSize() {
        return this.size
    }

    isNegative() {
        return this.bits[this.size - 1] === 1 && this.signed
    }

    toString() {
        return this.toBigInt().toString()
    }

    toBigInt() {
        const size = BigInt(this.size)
        let val = 0n
        let bits = this.bits

        if (this.isNegative()) {
            bits = this.twosComplement()
        }

        for (let i = 0n; i < size; ++i) {
            if (bits[i]) {
                val |= 1n << i
            }
        }

        if (this.isNegative()) {
            val = -val
        }

        return val
    }

    toBinary() {
        return [...this.bits].reverse().join('')
    }

    toNumber() {
        return Number(this.toBigInt())
    }

    /**
     * Tronque le nombre de n bits
     *
     * Attention la valeur retournée a de forte chance d'être différente de la
     * valeur précédente
     *
     * Si n est supérieur à la taille actuelle, la taille sera de 1
     *
     * @param {Number} n Le nombre de bits à supprimer
     * @returns Un nouvel Integer
     */
    truncate(n) {
        return new Integer(this, this.size - n, this.signed)
    }

    /**
     * Renvoie le nième bit du nombre
     *
     * @param {Number} n
     */
    bit(n) {
        if (n < this.size) {
            return this.bits[this.size - n - 1]
        }
        return 0
    }

    /**
     * Opération + avec un autre integer
     *
     * Attention à la taille des nombres fournis !
     * Si la taille d'un nombre est inférieur à l'autre et qu'il est négatif,
     * la valeur retournée sera faussée.
     *
     * Si l'opération + est faite sur des nombres signés, faites en sorte
     * qu'ils aient la même taille !
     *
     * @param {Integer|BigInt|Number} x
     * @returns Un nouvel Integer
     */
    add(x) {
        if (!(x instanceof Integer)) {
            x = new Integer(x, this.size)
        }

        // On choisit la taille du plus gros des deux
        // Ainsi x + y === y + x
        const size = Math.max(this.size, x.size)

        // Le tableau qui va servir pour créer le nombre
        let arr = new Array(size)
        let retainer = 0

        // On commence par le bit avec le poids le plus faible (celui qui est
        // le plus à droite)
        for (let i = size - 1; i >= 0; --i) {
            const bit = x.bit(i) + this.bit(i) + retainer

            switch (bit) {
                case 0:
                    retainer = 0
                    arr[i] = 0
                    break
                case 1:
                    retainer = 0
                    arr[i] = 1
                    break
                case 2:
                    retainer = 1
                    arr[i] = 0
                    break
                case 3:
                    retainer = 1
                    arr[i] = 1
                    break
            }
        }

        return new Integer(arr, size)
    }
}

Integer.prototype['+'] = function (x) {
    return this.add(x)
}

export function int(value, size = 64, signed = true) {
    return new Integer(value, size, signed)
}
