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
        this.police = this.getPolice()
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

    transform(x, y) {
        return `translate(${x}, ${y})`
    }

    getPolice() {
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
        return 'monospace'
    }
}

export default new Helper()
