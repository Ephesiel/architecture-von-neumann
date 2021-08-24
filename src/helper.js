import ClassicComponent from '@/models/registers/classic-component'
import InsulatorComponent from '@/models/registers/insulator-component'
import Register from '@/models/registers/register-model'
import InstructionRegister from '@/models/instruction-register-model'
import { Signals } from '@/globals'

/**
 * Classe qui regroupe des fonctions d'aide.
 *
 * Toutes les méthodes de cette classe sont ainsi statiques.
 */
class Helper {
    constructor() {
        this.police = this.getPolice()
        this.lineHeight = this.getLineHeight(
            document.getElementsByTagName('body')[0]
        )
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

    calculateSize(text, fontSize) {
        const canvas =
            this.calculateSize.canvas ||
            (this.calculateSize.canvas = document.createElement('canvas'))
        const context = canvas.getContext('2d')
        context.font = `${fontSize}px ${this.police}`
        const metrics = context.measureText(text)

        return {
            w: Math.ceil(metrics.width),
            h: fontSize * this.lineHeight,
        }
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

    getLineHeight(el) {
        let temp = document.createElement('div'),
            ret
        temp.setAttribute(
            'style',
            'margin:0; padding:0; ' +
                'font-family:' +
                (el.style.fontFamily || 'inherit') +
                '; ' +
                'font-size:' +
                (el.style.fontSize || 'inherit')
        )
        temp.innerHTML = 'A'

        el.parentNode.appendChild(temp)
        ret = temp.clientHeight
        temp.parentNode.removeChild(temp)

        const fontSize = parseInt(
            window.getComputedStyle(el).getPropertyValue('font-size'),
            10
        )

        return ret / fontSize
    }

    getSignalName(signal) {
        if (typeof signal !== 'string' && typeof signal !== 'number') {
            return ''
        }

        for (const [name, value] of Object.entries(Signals)) {
            if (value.toString() === signal.toString()) {
                return name
            }
        }

        return ''
    }
}

export default new Helper()
