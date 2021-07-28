import ClassicComponent from '@/models/registers/classic-component'
import InsulatorComponent from '@/models/registers/insulator-component'
import Register from '@/models/registers/register-model'
import InstructionRegister from '@/models/instruction-register-model'

/**
 * Classe qui regroupe des fonctions d'aide.
 *
 * Toutes les méthodes de cette classe sont ainsi statiques.
 */
class Helper {
    constructor() {
        //this.police = this.getPolice()
    }

    /**
     * Crée un objet bus/signal pour les registres.
     *
     * @param {Bus} bus Le bus concernée
     * @param {Signal|null} signal Le signal qui trigger le bus
     * @returns {Object} Un objet avec une ou deux clés : bus ou bus et signal.
     */
    makeRObj(bus, signal) {
        if (typeof signal === 'undefined' || signal === null) {
            return {
                bus: bus,
            }
        } else {
            return {
                bus: bus,
                signal: signal,
            }
        }
    }

    makeReg(name, inputObjects, outputObjects) {
        return new ClassicComponent(
            new Register(name, inputObjects, outputObjects)
        )
    }

    makeArchReg(name, inputObjects, outputObjects) {
        return new ClassicComponent(
            new InsulatorComponent(
                new Register(name, inputObjects, outputObjects)
            )
        )
    }

    makeRI(inputObjects, outputObjects, sequencerBus) {
        return new ClassicComponent(
            new InsulatorComponent(
                new InstructionRegister(
                    inputObjects,
                    outputObjects,
                    sequencerBus
                )
            )
        )
    }

    calculateFontSize(text, maxWidth, maxHeight) {
        let minSize = 1
        let maxSize = 128
        let size = 1
        let last = [minSize, size, maxSize]

        do {
            size = Math.round((minSize + maxSize) / 2)
            const m = this.calculateSize(text, size)

            if (m.w > maxWidth || m.h > maxHeight) {
                maxSize = size
            } else if (m.w <= maxWidth && m.h <= maxHeight) {
                minSize = size
            }

            if (
                JSON.stringify([minSize, size, maxSize]) == JSON.stringify(last)
            ) {
                // todo: fix this
                return size
            }
            last = [minSize, size, maxSize]
        } while (minSize + 1 !== maxSize)

        return minSize
    }

    calculateSize(text, fontSize) {
        const canvas =
            this.calculateSize.canvas ||
            (this.calculateSize.canvas = document.createElement('canvas'))
        const context = canvas.getContext('2d')
        context.font = `${fontSize}px ${this.police}`
        const metrics = context.measureText(text)

        return {
            w: Math.ceil(metrics.width),
            h:
                typeof metrics.fontBoundingBoxAscent === 'undefined'
                    ? metrics.actualBoundingBoxAscent +
                      metrics.actualBoundingBoxDescent
                    : metrics.fontBoundingBoxAscent +
                      metrics.fontBoundingBoxDescent,
        }
    }

    /**
     * Permet de récupérer un tableau contenant tous les objets du type donné
     * qui se trouve dans le json.
     *
     * Un objet "globals" peut exister dans le json, cet objet peut avoir des
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
     *     "globals": {
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
     * const registers = Helper.getJsonValues(json, 'registers')
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
     * Il est également possible d'ajouter des macros aux globals. Pour dire
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
     *     "globals": {
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
    getJsonValues(json, type) {
        if (typeof json !== 'object' || !Array.isArray(json[type])) {
            console.error(
                'Impossible de récupérer la valeur demandée, vérifiez que le ' +
                    'json est bien construit'
            )
            return []
        }

        const globals = {}
        const objects = {}
        const arrays = {}

        // On met les valeur par défaut du type donné.
        // Il peut y avoir plusieurs type. Si dans les valeurs par défaut se
        // trouve un objet "$nomObj", il sera remplacé par un objet de type
        // nomObj
        const createDefaultValues = (type) => {
            if (typeof globals[type] !== 'undefined') {
                return
            }
            if (typeof json.globals[type] !== 'object') {
                globals[type] = {}
                return
            }

            globals[type] = { ...json.globals[type] }
            objects[type] = {}
            arrays[type] = {}

            for (const [k, v] of Object.entries(globals[type])) {
                if (typeof v === 'string' && v.startsWith('$')) {
                    const t = v.slice(1)
                    globals[type][k] = null
                    objects[type][k] = t
                    createDefaultValues(t)
                }
                if (typeof v === 'string' && v.startsWith('&')) {
                    const t = v.slice(1)
                    globals[type][k] = []
                    arrays[type][k] = t
                    createDefaultValues(t)
                }
            }
        }

        if (typeof json.globals === 'object') {
            createDefaultValues(type)
        } else {
            globals[type] = {}
        }

        const verifyValue = (obj, type) => {
            for (const [k, v] of Object.entries(globals[type])) {
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

    transform(x, y) {
        return `translate(${x}, ${y})`
    }

    getPolice() {
        if (typeof document !== 'undefined') {
            const app = document.getElementById('nav')
            if (app !== null) {
                const style = window
                    .getComputedStyle(app, null)
                    .getPropertyValue('font-family')
                for (const font of style.split(', ')) {
                    if (document.fonts.check(`12px ${font}`)) {
                        console.log(font)
                        return font
                    }
                }
            }
        }
        return 'monospace'
    }
}

export default new Helper()
