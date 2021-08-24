/**
 * Permet de récupérer un tableau contenant tous les objets du type donné
 * qui se trouve dans le json.
 *
 * Un objet "props" peut exister dans le json, cet objet peut avoir des
 * sous objets qui représentent les valeurs "par défaut" d'un objet type.
 * Ainsi, si les valeurs ne sont pas donnés dans les objets, elles seront
 * automatiquement remplacées par les valeurs par défaut.
 *
 * Le type donné doit exister en tant que tableau dans le json donné.
 *
 * Exemple de Json :
 *
 * ```json
 * {
 *     "props": {
 *         "registers": {
 *             "x": 0,
 *             "y": 0,
 *             "w": 0,
 *             "h": 0
 *         }
 *     },
 *     "registers": [
 *         { "x": 10, "y": 20 },
 *         { "x": 10, "y": 20, "w": 10 }
 *     ]
 * }
 * ```
 * Et l'appel js
 * ```js
 * import json from 'example-json.json'
 *
 * const registers = getJsonValues(json, 'registers')
 * console.log(registers)
 * ```
 *
 * Le résulat serait alors
 * ```
 * [
 *     { x: 10, y: 20, w: 0, h: 0 },
 *     { x: 10, y: 20, w: 10, h: 0 }
 * ]
 * ```
 *
 * Il est également possible d'ajouter des macros aux props. Pour dire
 * qu'un objet contient d'autres objets, il faut mettre un "$" suivi du
 * type de l'objet.
 *
 * Si la clé n'existe pas, l'objet par défaut sera `null`. Sinon, l'objet
 * en valeur sera vérifié et ses valeurs par défaut seront aussi ajoutées.
 * Ceci est récursif et peut être fait avec n'importe quel type d'objet
 * contenu dans le json.
 *
 * Pour dire qu'un objet contient un **tableau** d'objets il faut faire la
 * même chose maiis avec un "&"
 *
 * Exemple de json contenant des macros :
 *
 * ```json
 * {
 *     "props": {
 *         "registers": {
 *             "x": 0,
 *             "y": 0,
 *             "w": 0,
 *             "h": 0,
 *             "outputBus": "$bus"
 *         },
 *         "bus": {
 *             "x": 0,
 *             "y": 0,
 *             "nextBus": "&bus"
 *         }
 *     },
 *     "registers": [
 *         { "x": 10, "y": 20 },
 *         { "x": 10, "y": 20, "outputBus": {"nextBus": [{}]} }
 *     ]
 * }
 * ```
 *
 * Avec le même appel que plus haut le résultat serait alors :
 * ```
 * [
 *     { x: 10, y: 20, w: 0, h: 0, outputBus: null },
 *     { x: 10, y: 20, w: 10, h: 0, outputBus: {
 *         x: 0, y: 0, nextBus: [{
 *             x: 0, y: 0, nextBus: []
 *         }]
 *     }}
 * ]
 * ```
 *
 * A noter que les types des valeurs doivent être respectés
 *
 * @param {Object} json Le Json dans lequel récupérer les données,
 *                      formatter comme un objet
 * @param {String} type Le type correspondant aux données à récupérer
 * @returns {Array}     Un tableau contenant tous les objets du type `type`
 *                      trouvés dans l'objet `json`
 */
export function getJsonValues(json, type) {
    if (typeof json !== 'object' || !Array.isArray(json[type])) {
        console.error(
            'Impossible de récupérer la valeur demandée, vérifiez que le ' +
                'json est bien construit'
        )
        return []
    }

    const props = {}
    const objects = {}
    const arrays = {}

    // On met les valeur par défaut du type donné.
    // Il peut y avoir plusieurs type. Si dans les valeurs par défaut se
    // trouve un objet "$nomObj", il sera remplacé par un objet de type
    // nomObj
    const createDefaultValues = (type) => {
        if (typeof props[type] !== 'undefined') {
            return
        }
        if (typeof json.props[type] !== 'object') {
            props[type] = {}
            return
        }

        props[type] = { ...json.props[type] }
        objects[type] = {}
        arrays[type] = {}

        for (const [k, v] of Object.entries(props[type])) {
            if (typeof v === 'string' && v.startsWith('$')) {
                const t = v.slice(1)
                props[type][k] = null
                objects[type][k] = t
                createDefaultValues(t)
            }
            if (typeof v === 'string' && v.startsWith('&')) {
                const t = v.slice(1)
                props[type][k] = []
                arrays[type][k] = t
                createDefaultValues(t)
            }
        }
    }

    if (typeof json.props === 'object') {
        createDefaultValues(type)
    } else {
        props[type] = {}
    }

    const verifyValue = (obj, type) => {
        for (const [k, v] of Object.entries(props[type])) {
            // Objet spécifique dont il faut vérifier toutes les clés
            if (k in objects[type]) {
                // Si la clé n'existe pas ou que la valeur est absurde, on
                // remplace par null
                if (typeof obj[k] !== 'object' || Array.isArray(obj[k])) {
                    obj[k] = null
                } else if (obj[k] !== null) {
                    obj[k] = verifyValue(obj[k], objects[type][k])
                }
            } else if (k in arrays[type]) {
                // Si la clé n'est pas un tableau, on remplace par un
                // tableau vide
                if (!Array.isArray(obj[k])) {
                    obj[k] = []
                } else {
                    obj[k] = obj[k].map((o) => {
                        return verifyValue(o, arrays[type][k])
                    })
                }
            } else if (
                typeof obj[k] !== typeof v ||
                Array.isArray(v) ^ Array.isArray(obj[k])
            ) {
                obj[k] = v
            }
        }

        return obj
    }

    return json[type].map((v) => verifyValue({ ...v }, type))
}

/**
 * Vérifie qu'une valeur est d'un certain type.
 * Si la valeur n'existe pas ou n'est pas du bon type, renvoie une valeur
 * par défaut. Si la valeur est du bon type, la même valeur est renvoyée.
 *
 * Il est possible de donner une valeur par défaut à renvoyer si la valeur
 * n'est pas bonne. Si aucune valeur n'est donnée en troisième paramètre,
 * la fonction renverra une valeur par défaut en fonction du type.
 *
 * @param {*} value La valeur a vérifier
 * @param {String|Object} type Le type que doit avoir la valeur
 * @param {*} defaultValue La valeur par défaut à renvoyer si la valeur
 *                         n'est pas du bon type
 * @returns
 */
export function verifyValue(value, type, defaultValue = undefined) {
    const defaultValues = {
        number: 0,
        boolean: false,
        string: '',
        bigint: 0n,
        function: () => {},
        array: [],
        object: null,
    }

    let goodValue = false

    switch (type) {
        case 'number':
        case 'boolean':
        case 'string':
        case 'bigint':
        case 'function':
            goodValue = typeof value === type
            break
        case 'array':
            goodValue = Array.isArray(value)
            break
        case 'object':
            goodValue = typeof value === type && !Array.isArray(value)
            break
        default:
            if (typeof type === 'function') {
                goodValue = value instanceof type
            }
    }

    if (goodValue) {
        return value
    }
    if (typeof defaultValue !== 'undefined') {
        return defaultValue
    }
    if (typeof defaultValues[type] !== 'undefined') {
        return defaultValues[type]
    }

    return null
}
