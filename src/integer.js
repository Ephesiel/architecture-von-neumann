/**
 * ## Motivation :
 *
 * Les signaux électrique d'une architecture permettent d'envoyer dans les fils
 * des 0 ou des 1, représentant l'information.
 *
 * Les bus représentent plusieurs fils permettant de représenter des mots
 * binaires.
 * Techniquement, il est possible que ces bus puissent prendre un nombre
 * quelconque de fils.
 *
 * L'information est donc représentée sur une quantité de bits non identique en
 * fonction des différents bus, il peut y avoir 1, 2, 32, 64 bits... De manière
 * générale, il y en a souvent une puissance de deux, mais ce n'est pas
 * obligatoire.
 *
 * Il est donc important de connaître l'information de ces bus et de pouvoir la
 * stocker dans notre programme sans trop de mal.
 * C'est à ça que sert cette classe, à stocker un nombre en fonction de sa
 * taille.
 * Il est également possible d'effectuer des opérations élémentaires et d'avoir
 * les bits tronqués dans le cas où le résultat serait "trop grand", permettant
 * de simuler au mieux l'architecture.
 *
 * Les entiers en javascripts sont trop instables et ne présentent pas bien un
 * nombre. Lorsqu'il est trop grand, le chiffre est déformé.
 *
 * Il existe la possibilité de faire des BigInt pour les grands nombres, mais
 * leur utilisation est fastidieuse et cette classe permet de cacher cette
 * utilisation aux yeux des utilisateurs.
 *
 * Les bits sont représentés par un tableau de n entier qui valent 0 ou 1. Le
 * MSB (Most Significant Bit) est le chiffre d'indice n - 1 et le LSB (least
 * Significant Bit) l'indice 0.
 *
 * ## Création :
 *
 * Il est possible de créer un Integer de différentes façons :
 *  - Depuis un nombre
 *  - Depuis un BigInt
 *  - Depuis une string ou un tableau représentant un nombre binaire
 *
 * Il faut ensuite lui donner sa taille et dire s'il est signé ou non (signé
 * par défaut)
 *
 * ```js
 * // Entier signé sur 32 bits valant 12
 * new Integer(12, 32, true)
 *
 * // Entier non signé sur 64 bits valant 9223372036854775807
 * new Integer(9223372036854775807n, 64, false)
 *
 * // Entier signé sur 10 bits valant 4
 * new Integer('0100', 10)
 *
 * // Entier signé sur 3 bits valant 4
 * new Integer([0, 1, 0, 0], 3)
 * ```
 *
 * Il est possible d'appeler la méthode `int(...)` qui est un alias de `new
 * Integer(...)`
 *
 * ## Opérations :
 *
 * Les opérations sont toutes créées à la main pour être plus proche des
 * opérations de l'architecture.
 *
 * Les opérations définies sont les suivantes :
 *  - addition (+)
 *  - opposée (- unaire)
 *  - décalage de bits vers la gauche (<<)
 *  - décalage de bits vers la droite (>>)
 *
 * Il est possible de les appeler avec les mêmes choses que pour créer un
 * Integer (Nombre, BigInt...) ou avec un autre Integer.
 *
 * ### L'addition
 *
 * Ajoute un integer à un autre. Attention à la taille de ces derniers ! En
 * effet la taille du nombre renvoyée sera la plus grande des deux nombres
 * donnés et les signes peuvent être modifié en fonction de cette taille !
 *
 * Mots clés : `.add()`, `['+']()`
 *
 * Exemples :
 *
 * ```js
 * // -1
 * int(2, 16).add(-3)
 * // -1
 * int(2, 16).add(int(-3, 16))
 * // 15, même si la valeur est -3, l'addition bit à bit renvoie 16 bits et le
 * // 4ème bit ne représente plus le signe !
 * int(2, 16)['+'](int(-3, 4))
 * ```
 *
 * ### L'opposée
 *
 * Envoie l'inverse d'un integer. Ne marche évidememnt pas correctement sur les
 * entiers non signés
 *
 * Mot clés : `.opposite()`, `['-']()`
 *
 * Exemples :
 *
 * ```js
 * // -3
 * int(3, 16).opposite()
 * // 65533, le complément à 2 n'est pas fait pour les entiers non signés
 * int(3, 16, false)['-']()
 * ```
 *
 * ### Les décalages de bits
 *
 * Décale les bits vers la droite ou vers la gauche selon le sens voulu.
 * Le décalage de bits vers la gauche représente une puissance de 2
 * Le décalage de bits vers la droite représente un log base 2
 *
 * Mot clés : `.leftShift()`, `['<<']()`, `.rightShift()`, `['>>']()`
 *
 * Exemples :
 *
 * ```js
 * let x = int(5, 8)
 * let y = x.leftShift(3)
 * let z = y['<<'](3)
 *
 * x.toBinary() // '00000101'
 * y.toBinary() // '00101000'
 * z.toBinary() // '01000000'
 *
 * x = int(-5, 8)
 * y = x.rightShift(3)
 * z = y['>>'](3)
 *
 * x.toBinary() // '11111011'
 * y.toBinary() // '00011111'
 * z.toBinary() // '00000011'
 * ```
 */
class Integer {
    // ------------------------------------------------------------------------
    // Attributs.

    // /!\ IMPORTANT /!\
    // Les bits sont stockés de LSB vers MSB, l'inverse de l'habitude de
    // lecture de nombres. Ainsi, lorsque l'on créé un nombre depuis une string
    // ou un tableau, on attend une valeur dans le "bon sens" qui est ensuite
    // retournée. C'est également pour ça que la plupart des opérations utilise
    // la méthode `reverse()` sur les bits
    bits //: Array de 0 et 1 de LSB vers MSB
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

    copy() {
        return new Integer(this, this.size, this.signed)
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
        if (n < this.size && n >= 0) {
            return this.bits[this.size - n - 1]
        }
        return 0
    }

    /**
     * "Coupe" le nombre en prenant un certain nombre de bits adjacents.
     * Le sens de la découpe est de LSB vers MSB
     *
     * Le signe du nouvel integer est le même que celui donné en paramètre
     * n ne doit pas être négatif
     *
     * @param {Number} n      Premier bits du découpage
     * @param {Number} length Longueur du découpage
     *
     * @returns Un nouvel Integer de taille `length`
     */
    slice(n, length) {
        return new Integer(
            this.bits.slice(n, n + length).reverse(),
            length,
            this.signed
        )
    }

    // ------------------------------------------------------------------------
    // Opérations.

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
        // Le nombre retourné est signé uniquement si les deux nombres le sont
        // Ainsi x + y === y + x
        const size = Math.max(this.size, x.size)
        const signed = this.signed && x.signed

        // Le tableau qui va servir pour créer le nombre
        let bits = new Array(size)
        let retainer = 0

        // On commence par le bit avec le poids le plus faible (celui qui est
        // le plus à droite)
        for (let i = size - 1; i >= 0; --i) {
            const bit =
                x.bit(x.size - size + i) +
                this.bit(this.size - size + i) +
                retainer

            switch (bit) {
                case 0:
                    retainer = 0
                    bits[i] = 0
                    break
                case 1:
                    retainer = 0
                    bits[i] = 1
                    break
                case 2:
                    retainer = 1
                    bits[i] = 0
                    break
                case 3:
                    retainer = 1
                    bits[i] = 1
                    break
            }
        }

        return new Integer(bits, size, signed)
    }

    /**
     * Opération - unaire
     *
     * Envoi l'opposée de cet Integer.
     * Il est évident que cette fonction ne devrait être appelée que sur les
     * entiers signés. Si c'est fait, le résultat sera bizarre pour un entier
     * non signé car on fait l'inversion des bits selon le complément à deux.
     *
     * @returns Un nouvel Integer
     */
    opposite() {
        return new Integer(
            this.twosComplement().reverse(),
            this.size,
            this.signed
        )
    }

    /**
     * Décalage de bits vers la gauche. On les décale de n bits.
     * Les bits les plus à gauche sont perdus
     * Les bits ajoutés à droite sont mis à 0
     * Peut être utilisé pour la puissance de 2.
     *
     * @param {Number} n le nombre de bits de décalage
     * @returns Un nouvel integer
     */
    leftShift(n) {
        let bits = [...this.bits].reverse()

        for (let i = 0; i < this.size - n; ++i) {
            bits[i] = bits[i + n]
        }
        for (let i = this.size - n; i < this.size; ++i) {
            bits[i] = 0
        }

        return new Integer(bits, this.size, this.signed)
    }

    /**
     * Décalage de bits vers la droite. On les décale de n bits.
     * Les bits les plus à droite sont perdus
     * Les bits ajoutés à gauche sont mis à 0
     * Peut être utilisé pour le log base 2.
     *
     * @param {Number} n le nombre de bits de décalage
     * @returns Un nouvel integer
     */
    rightShift(n) {
        let bits = [...this.bits]

        for (let i = 0; i < this.size - n; ++i) {
            bits[i] = bits[i + n]
        }
        for (let i = this.size - n; i < this.size; ++i) {
            bits[i] = 0
        }

        return new Integer(bits.reverse(), this.size, this.signed)
    }
}

Integer.prototype['+'] = function (x) {
    return this.add(x)
}

Integer.prototype['-'] = function () {
    return this.opposite()
}

Integer.prototype['<<'] = function (x) {
    return this.leftShift(x)
}

Integer.prototype['>>'] = function (x) {
    return this.rightShift(x)
}

export function int(value, size = 64, signed = true) {
    return new Integer(value, size, signed)
}