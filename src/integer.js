import { NB_BITS_ARCH } from '@/constants'

const LOWER = 1
const EQUAL = 2
const GREATER = 3
const SIGNED = true
const UNSIGNED = false

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
 * Integer(..., true)` et `uint(..., false)` pour créer un entier non signé
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
 *  - non logique
 *  - ou logique
 *  - et logique
 *  - xor logique
 *
 * Il est possible de les appeler avec les mêmes choses que pour créer un
 * Integer (Nombre, BigInt...) ou avec un autre Integer.
 *
 * Attention à la taille des paramètres envoyés ! En effet la taille du nombre
 * renvoyé sera la plus grande des deux nombres donnés et les signes peuvent
 * être modifié en fonction de cette taille !
 *
 * ### L'addition
 *
 * Ajoute un integer à un autre.
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
 * uint(3, 16)['-']()
 * ```
 *
 * ### La soustraction
 *
 * la soustraction est équivalente à l'opposition mise à part qu'elle prend un
 * paramètre.
 *
 * Mots clés : `.sub()`, `['-']()`
 *
 * Exemples :
 *
 * ```js
 * // 0
 * int(3, 16).sub(3)
 * // 10, Marche aussi sur les entiers non signés
 * uint(7, 4)['-'](int(-3, 4))
 * ```
 *
 * ### La multiplication
 *
 * Multiplie un integer avec un autre, attention à ce que le résultat ne
 * dépasse pasla taille, le retour serait alors innatendu
 *
 * Mots clés : `.mult()`, `['*']()`
 *
 * Exemples :
 *
 * ```js
 * // 9
 * int(3, 8).mult(3)
 * // -6
 * int(-3, 8).mult(int(2, 8))
 * // -40, même si la valeur est 216, le résultat est sur 8 bits signés !
 * int(3, 8)['*'](72)
 * ```
 *
 * ### La puissance
 *
 * Met un int à la puissance d'un autre, attention, la puissance ne peut être
 * négative car nous sommes sur des entiers !
 *
 * Mots clés : `.pow()`, `['**']()`
 *
 * Exemples :
 *
 * ```js
 * // 8
 * int(2, 8).pow(3)
 * // -27
 * int(-3, 8)['**'](3)
 * // Erreur ! Impossible de faire une puissance négative
 * int(3, 8).pow(-3)
 * ```
 *
 * ### La valeur absolue
 *
 * Renvoie la valeur absolue d'un nombre
 *
 * Mot clé : `.abs()`
 *
 * Exemples :
 *
 * ```js
 * // 3
 * int(3, 8).abs()
 * // 3
 * int(-3, 8).abs()
 * ```
 *
 * ### Les décalages de bits
 *
 * Décale les bits vers la droite ou vers la gauche selon le sens voulu.
 * Le décalage de bits vers la gauche représente une puissance de 2
 * Le décalage de bits vers la droite représente un log base 2
 *
 * Mot clés :
 *  - `.leftShift()`, `['<<']()`
 *  - `.rightShift()`, `['>>']()`
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
 *
 * ### Opérateur logique
 *
 * Permet de faire des opérations logiques sur les bits des nombres sans les
 * modifier. Le nombre renvoyé est de la taille du plus gros des deux.
 *
 * Mots clés :
 *  - `.not()`, `['~']()`
 *  - `.or()`, `['|']()`
 *  - `.and()`, `['&']()`
 *  - `.xor()`, `['^']()`
 *
 * Exemples :
 *
 * ```js
 * let x = int(5, 8)
 * let y = int(-13, 8)
 *
 * x.toBinary() // '00000101'
 * y.toBinary() // '11110011'
 *
 * x.not().toBinary() // 11111010
 * y.not().toBinary() // 00001100
 *
 * x.or(y).toBinary() // 11110111
 * x.and(y).toBinary() // 00000001
 * x.xor(y).toBinary() // 11110110
 * ```
 *
 * ### Comparaisons
 *
 * Les opérateurs de comparaisons habituels ont également été ajoutés : ==, !=,
 * >, <, >=, <=.
 * Ils renvoient des booléens
 *
 * Mots clés :
 *  - `.eq()`, `['==']()`
 *  - `.neq()`, `['!=']()`
 *  - `.gt()`, `['>']()`
 *  - `.lt()`, `['<']()`
 *  - `.ge()`, `['>=']()`
 *  - `.le()`, `['<=']()`
 *
 * Exemples :
 *
 * ```js
 * let x = int(5, 8)
 * let y = int(-13, 8)
 * let z = -13
 *
 * x.eq(y)    // false
 * x['=='](z) // false
 * y.eq(z)    // true
 *
 * x.neq(y)   // true
 * x['!='](z) // true
 * y.neq(z)   // false
 *
 * x.gt(y)    // true
 * x['>'](z)  // true
 * y.gt(z)    // false
 *
 * x.lt(y)    // false
 * x['<'](z)  // false
 * y.lt(z)    // false
 *
 * x.ge(y)    // true
 * x['>='](z) // true
 * y.ge(z)    // true
 *
 * x.le(y)    // false
 * x['<='](z) // false
 * y.le(z)    // true
 * ```
 */
export default class Integer {
    // ------------------------------------------------------------------------
    // Attributs.

    // /!\ IMPORTANT /!\
    // Les bits sont stockés de LSB vers MSB, l'inverse de l'habitude de
    // lecture de nombres. Mais, lorsque l'on créé un nombre depuis une string
    // ou un tableau, on attend une valeur dans le "bon sens" qui est ensuite
    // retournée.
    bits //: Array de 0 et 1 de LSB vers MSB
    size //: Number
    signed //: Boolean

    // ------------------------------------------------------------------------
    // Constructeur.

    constructor(value, size, signed = SIGNED) {
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

    toUint() {
        return new Integer(this, this.size, false)
    }

    toInt() {
        return new Integer(this, this.size, true)
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
     * Tronque le nombre de n bits en partant du MSB
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
     * Ajoute n MSBits mis à 0
     *
     * Attention, si le nombre est négatif, il deviendra positif
     *
     * @param {Number} n Le nombre de bits à ajouter
     * @returns Un nouvel Integer
     */
    extend(n) {
        return new Integer(this, this.size + n, this.signed)
    }

    /**
     * Renvoie le même int mais sans tous les zéros devant
     * La taille sera modifiée, attention au nombre signé, ils seront toujours
     * négatifs à la sortie de cette méthode !
     *
     * @returns Un nouvel integer
     */
    removeZeroes() {
        for (let i = this.size - 1; i >= 0; --i) {
            if (this.bit(i) === 1) {
                return this.truncate(this.size - 1 - i)
            }
        }
    }

    /**
     * Renvoie le nième bit du nombre en partant du LSB
     *
     * @param {Number} n
     */
    bit(n) {
        if (n < this.size && n >= 0) {
            return this.bits[n]
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

    /**
     * Retourne vrai si la valeur est impaire
     */
    isOdd() {
        return this.bit(0) === 1
    }

    /**
     * Retourne vrai si la valeur est paire
     */
    isEven() {
        return this.bit(0) === 0
    }

    // ------------------------------------------------------------------------
    // Opérations.

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
        let result = this.copy()
        n = Math.min(this.size, n)

        for (let i = result.size - 1; i >= n; --i) {
            result.bits[i] = result.bits[i - n]
        }
        for (let i = n - 1; i >= 0; --i) {
            result.bits[i] = 0
        }

        return result
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
        let result = this.copy()
        n = Math.min(this.size, n)

        for (let i = 0; i < result.size - n; ++i) {
            result.bits[i] = result.bits[i + n]
        }
        for (let i = result.size - n; i < result.size; ++i) {
            result.bits[i] = 0
        }

        return result
    }

    /**
     * Permet de faire un non logique de cet integer
     *
     * @returns Un nouvel integer
     */
    not() {
        let result = this.copy()

        for (let i = 0; i < result.size; ++i) {
            result.bits[i] = result.bits[i] === 0 ? 1 : 0
        }

        return result
    }

    /**
     * Permet de faire un ou logique entre un integer et un autre
     *
     * La taille du retour sera celle du plus grand des deux
     *
     * @param {Integer|BigInt|Number} x Avec lequel faire le ou logique
     * @returns Un nouvel integer
     */
    or(x) {
        if (!(x instanceof Integer)) {
            x = new Integer(x, this.size, this.signed)
        }
        if (this.size < x.size) {
            return x.or(this)
        }

        let result = this.copy()

        for (let i = 0; i < x.size; ++i) {
            result.bits[i] |= x.bits[i]
        }

        return result
    }

    /**
     * Permet de faire un et logique entre un integer et un autre
     *
     * La taille du retour sera celle du plus grand des deux
     *
     * @param {Integer|BigInt|Number} x Avec lequel faire le et logique
     * @returns Un nouvel integer
     */
    and(x) {
        if (!(x instanceof Integer)) {
            x = new Integer(x, this.size, this.signed)
        }
        if (this.size < x.size) {
            return x.and(this)
        }

        let result = this.copy()

        for (let i = 0; i < x.size; ++i) {
            result.bits[i] &= x.bits[i]
        }
        for (let i = x.size; i < this.size; ++i) {
            result.bits[i] = 0
        }

        return result
    }

    /**
     * Permet de faire un ou exclusif logique entre un integer et un autre
     *
     * La taille du retour sera celle du plus grand des deux
     *
     * @param {Integer|BigInt|Number} x Avec lequel faire le xor logique
     * @returns Un nouvel integer
     */
    xor(x) {
        if (!(x instanceof Integer)) {
            x = new Integer(x, this.size, this.signed)
        }
        if (this.size < x.size) {
            return x.xor(this)
        }

        let result = this.copy()

        for (let i = 0; i < x.size; ++i) {
            result.bits[i] ^= x.bits[i]
        }

        return result
    }

    /**
     * Opération + avec un autre integer
     *
     * La taille du retour sera celle du plus grand des deux
     *
     * Attention à la taille des nombres fournis !
     * Si la taille d'un nombre est inférieur à l'autre et qu'il est négatif,
     * la valeur retournée sera faussée.
     *
     * Si l'opération + est faite sur des nombres signés, faites en sorte
     * qu'ils aient la même taille !
     *
     * @param {Integer|BigInt|Number} x Avec lequel faire l'addition
     * @returns Un nouvel Integer
     */
    add(x) {
        if (!(x instanceof Integer)) {
            x = new Integer(x, this.size, this.signed)
        }
        if (this.size < x.size) {
            return x.add(this)
        }

        let result = this.copy()

        // retenu de l'addition
        let retainer = 0

        for (let i = 0; i < x.size; ++i) {
            const bit = x.bit(i) + this.bit(i) + retainer

            switch (bit) {
                case 0:
                    retainer = 0
                    result.bits[i] = 0
                    break
                case 1:
                    retainer = 0
                    result.bits[i] = 1
                    break
                case 2:
                    retainer = 1
                    result.bits[i] = 0
                    break
                case 3:
                    retainer = 1
                    result.bits[i] = 1
                    break
            }
        }

        return result
    }

    /**
     * Opération - binaire
     *
     * La taille du retour sera celle du plus grand des deux
     *
     * @param {Integer|BigInt|Number} x Avec lequel faire la soustraction
     * @returns Un nouvel integer
     */
    sub(x) {
        if (!(x instanceof Integer)) {
            x = new Integer(x, this.size, this.signed)
        }

        return this.add(x.opposite())
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
     * Valeur absolue
     *
     * @returns Un nouvel integer
     */
    abs() {
        return this.isNegative() ? this.opposite() : this.copy()
    }

    /**
     * Opération * avec un autre integer
     *
     * La taille du retour sera celle du plus grand des deux
     *
     * @param {Integer|BigInt|Number} x Avec lequel faire la multiplication
     * @returns Un nouvel Integer
     */
    mult(x) {
        if (!(x instanceof Integer)) {
            x = new Integer(x, this.size, this.signed)
        }
        if (this.size < x.size) {
            return x.mult(this)
        }

        let result = new Integer(0, this.size, this.signed && x.signed)
        let y = this

        for (let i = 0; i < x.size; ++i) {
            if (x.bits[i] === 1) {
                result = result.add(y.leftShift(i))
            }
        }

        return result
    }

    /**
     * Opération ** avec un autre integer
     *
     * La taille du retour sera celle du nombre qui fait l'opération
     * La puissance ne doit pas être négative car nous travaillons sur des
     * entiers
     *
     * @param {Integer|BigInt|Number} x Avec lequel faire la multiplication
     * @throws Error Si x est négatif
     * @returns Un nouvel Integer
     */
    pow(x) {
        if (!(x instanceof Integer)) {
            x = new Integer(x, this.size, UNSIGNED)
        }

        if (x.isNegative()) {
            throw new Error(`La valeur de ${x} doit être positive`)
        }

        if (x.eq(0)) {
            return new Integer(1, this.size, this.signed)
        }

        if (x.eq(1)) {
            return this.copy()
        }

        if (x.isEven()) {
            return this.mult(this).pow(x.rightShift(1))
        }

        return this.mult(this.mult(this).pow(x.rightShift(1)))
    }

    /**
     * Permet de combiner le modulo et la division en une seule fonction
     * Ne pas appeler cette méthode depuis l'extérieur, privilégier `div` et
     * `mod`
     */
    division(x) {
        /////////////////////////////
        //// A IMPLEMENTER MIEUX ////
        /////////////////////////////

        if (!(x instanceof Integer)) {
            x = new Integer(x, this.size, this.signed)
        }

        const size = Math.max(x.size, this.size)
        const signed = x.signed && this.signed

        let valX = x.toBigInt()
        let valY = this.toBigInt()

        if (!signed) {
            valX = x.toUint().toBigInt()
            valY = this.toUint().toBigInt()
        }

        let remainder = new Integer(valY % valX, size, signed)
        let result = new Integer(
            (valY - remainder.toBigInt()) / valX,
            size,
            signed
        )

        return [result, remainder]
    }

    /**
     * Opération / sur des entiers
     *
     * La taille du retour sera celle du plus grand des deux
     *
     * @param {Integer|BigInt|Number} x Avec lequel faire la division
     * @returns Un nouvel Integer
     */
    div(x) {
        return this.division(x)[0]
    }

    /**
     * Opération % sur des entiers
     *
     * La taille du retour sera celle du plus grand des deux
     *
     * @param {Integer|BigInt|Number} x Avec lequel faire le modulo
     * @returns Un nouvel Integer
     */
    mod(x) {
        return this.division(x)[1]
    }

    /**
     * Renvoie la comparaison entre this et x. Cette méthode ne devrait pas
     * être appelée en dehors de la classe car elle possède des alias pour les
     * comparaisons habituelles.
     *
     * Résultat :
     *  - Si this > x : GREATER
     *  - Si this = x : EQUAL
     *  - Si this < x : LOWER
     *
     * @param {Integer|BigInt|Number} x Le nombre avec lequel se comparer
     */
    compare(x) {
        if (!(x instanceof Integer)) {
            x = new Integer(x, this.size, this.signed)
        }

        let y = this

        const xNeg = x.isNegative()
        const yNeg = y.isNegative()

        if (xNeg && !yNeg) {
            return GREATER
        } else if (!xNeg && yNeg) {
            return LOWER
        } else if (xNeg && yNeg) {
            // On inverse les chiffres avec leur opposée, car sinon le
            // résultat de l'opposée serait l'inverse de celui recherché
            // x > y <=> -x < -y
            const z = y.opposite()
            y = x.opposite()
            x = z
        }

        // On ne gère que des nombres positifs, le premier bits à 1 alors que
        // l'autre est à 0 est plus grand
        for (let i = Math.max(y.size, x.size) - 1; i >= 0; --i) {
            const bitX = x.bit(i)
            const bitY = y.bit(i)

            if (bitX && !bitY) {
                return LOWER
            } else if (bitY && !bitX) {
                return GREATER
            }
        }

        return EQUAL
    }

    eq(x) {
        return this.compare(x) === EQUAL
    }

    neq(x) {
        return !this.eq(x)
    }

    gt(x) {
        return this.compare(x) === GREATER
    }

    lt(x) {
        return this.compare(x) === LOWER
    }

    ge(x) {
        return !this.lt(x)
    }

    le(x) {
        return !this.gt(x)
    }
}

Integer.prototype['+'] = function (x) {
    return this.add(x)
}

Integer.prototype['-'] = function (x) {
    if (typeof x === 'undefined') {
        return this.opposite()
    }
    return this.sub(x)
}

Integer.prototype['*'] = function (x) {
    return this.mult(x)
}

Integer.prototype['**'] = function (x) {
    return this.pow(x)
}

Integer.prototype['/'] = function (x) {
    return this.div(x)
}

Integer.prototype['%'] = function (x) {
    return this.mod(x)
}

Integer.prototype['<<'] = function (x) {
    return this.leftShift(x)
}

Integer.prototype['>>'] = function (x) {
    return this.rightShift(x)
}

Integer.prototype['~'] = function () {
    return this.not()
}

Integer.prototype['&'] = function (x) {
    return this.and(x)
}

Integer.prototype['|'] = function (x) {
    return this.or(x)
}

Integer.prototype['^'] = function (x) {
    return this.xor(x)
}

Integer.prototype['=='] = function (x) {
    return this.eq(x)
}

Integer.prototype['!='] = function (x) {
    return this.neq(x)
}

Integer.prototype['<'] = function (x) {
    return this.lt(x)
}

Integer.prototype['>'] = function (x) {
    return this.gt(x)
}

Integer.prototype['<='] = function (x) {
    return this.le(x)
}

Integer.prototype['>='] = function (x) {
    return this.ge(x)
}

export function int(value, size = NB_BITS_ARCH, signed = SIGNED) {
    return new Integer(value, size, signed)
}

export function uint(value, size = NB_BITS_ARCH) {
    return new Integer(value, size, UNSIGNED)
}

export function maxOf(bits, signed = UNSIGNED) {
    if (signed === UNSIGNED) {
        return uint(0, bits).not()
    } else {
        return int(1, bits)
            .leftShift(bits - 1)
            .not()
    }
}

export { SIGNED, UNSIGNED }
