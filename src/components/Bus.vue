<template>
    <template v-for="(bus, index) of nextBuses" :key="index">
        <path
            :d="path(bus)"
            :stroke="color"
            :stroke-width="width"
            :stroke-dasharray="powers[index] ? animationStrokeDasharray : 0"
            fill="none"
        >
            <animate
                v-if="powers[index]"
                dur="20000s"
                repeatCount="indefinite"
                attributeName="stroke-dashoffset"
                :by="20 * powerSpeed * 100 * (powerFromSignal ? 1 : -1) + '%'"
            />
        </path>
        <circle
            v-if="bus.signal !== null && bus.signal.insulator !== null"
            v-bind="insulatorDraw(bus)"
            :fill="
                powers[index] ? activeInsulatorColor : inactiveInsulatorColor
            "
            :stroke="insulatorStrokeColor"
            :stroke-width="insulatorStrokeWidth"
        />
        <path
            v-for="(arrow, indexArrow) of bus.arrows"
            :key="indexArrow"
            :d="pathForArrow(arrow, bus)"
            :stroke="color"
            :stroke-width="width"
            fill="none"
        />
        <Bus :datas="bus" @power="onPower(index, $event)" />
    </template>
    <text
        v-for="(label, index) of labels"
        :key="index"
        :x="x + label.x"
        :y="y + label.y"
        font-weight="bold"
        >{{ name }}</text
    >
    <text v-if="signal !== null" v-bind="signalText">{{ signal.name }}</text>
</template>

<script>
import { Signals } from '@/globals'
import { verifyValue } from '@/functions'
import architectureStyle from '@/view-datas/architecture-style.json'

export default {
    emits: ['power'],
    props: {
        datas: { type: Object, default: () => {} },
    },
    data() {
        return {
            powers: [],
            width: architectureStyle.busWidth,
            powerSpeed: architectureStyle.busAnimationSpeed,
            animationStrokeDasharray:
                architectureStyle.busAnimationStrokeDasharray,

            inactiveSignalColor: architectureStyle.inactiveSignalColor,
            activeSignalColor: architectureStyle.activeSignalColor,

            inactiveInsulatorColor: architectureStyle.inactiveInsulatorColor,
            insulatorStrokeColor: architectureStyle.insulatorStrokeColor,
            insulatorStrokeWidth: architectureStyle.insulatorStrokeWidth,
            insulatorRadius: architectureStyle.insulatorRadius,
            activeInsulatorColor: architectureStyle.activeInsulatorColor,

            arrowSize: architectureStyle.busArrowSize,
            arrowAngle: architectureStyle.busArrowAngle,
        }
    },
    computed: {
        name() {
            return verifyValue(this.datas.name, 'string', 'Bus unamed')
        },
        x() {
            return verifyValue(this.datas.x, 'number')
        },
        y() {
            return verifyValue(this.datas.y, 'number')
        },
        color() {
            return verifyValue(this.datas.color, 'string', 'black')
        },
        powerFromSignal() {
            return verifyValue(this.datas.powerFromSignal, 'boolean')
        },
        signal() {
            return this.verifySignal(this.datas.signal)
        },
        labels() {
            return this.verifyLabels(this.datas.labels)
        },
        nextBuses() {
            return this.verifyNextBuses(this.datas.next)
        },
        power() {
            return this.signal === null
                ? false
                : this.$store.state.engine.signals[Signals[this.signal.name]]
        },
        signalText() {
            return {
                x: this.x + this.signal.x,
                y: this.y + this.signal.y,
                fill: this.power
                    ? this.activeSignalColor
                    : this.inactiveSignalColor,
            }
        },
    },
    watch: {
        power: function () {
            this.$emit('power', this.power)
        },
    },
    methods: {
        verifyLabels(labels) {
            labels = verifyValue(labels, 'array')

            for (const label of labels) {
                label.x = verifyValue(label.x, 'number')
                label.y = verifyValue(label.y, 'number')
            }

            return labels
        },
        verifyBridges(bridges) {
            bridges = verifyValue(bridges, 'array')

            for (const bridge of bridges) {
                bridge.dist = verifyValue(bridge.dist, 'number')
                bridge.size = verifyValue(bridge.size, 'number', 1)
            }

            // On trie les ponts car on en aura besoin pour faire le path
            // S'ils ne sont pas dans l'ordre, ça risque de faire un chemin étrange
            bridges.sort((b1, b2) => {
                return b1.dist > b2.dist ? 1 : b1.dist < b2.dist ? -1 : 0
            })

            return bridges
        },
        verifyArrows(arrows) {
            arrows = verifyValue(arrows, 'array')

            for (const arrow of arrows) {
                arrow.dist = verifyValue(arrow.dist, 'number')
            }

            return arrows
        },
        verifySignal(signal) {
            signal = verifyValue(signal, 'object')

            if (signal !== null) {
                signal.name = verifyValue(signal.name, 'string')
                signal.x = verifyValue(signal.x, 'number')
                signal.y = verifyValue(signal.y, 'number')
                signal.insulator = verifyValue(signal.insulator, 'object')

                if (signal.insulator !== null) {
                    signal.insulator.dist = verifyValue(
                        signal.insulator.dist,
                        'number'
                    )
                }
            }

            return signal
        },
        verifyNextBuses(nextBuses) {
            nextBuses = verifyValue(nextBuses, 'array')
            const nextB = []

            for (const bus of nextBuses) {
                // Deep copy à cause des + sur les coordonnées
                // Sinon lorsque l'objet est rerender, l'objet `datas` aura été
                // modifié, ce qu'il ne faut absolument pas faire
                const b = { ...bus }

                b.name = this.name
                b.color = this.color
                b.powerFromSignal = this.powerFromSignal
                b.x += this.x
                b.y += this.y
                b.arrows = this.verifyArrows(bus.arrows)
                b.bridges = this.verifyBridges(bus.bridges)
                b.signal = this.verifySignal(bus.signal)

                nextB.push(b)
            }

            return nextB
        },
        onPower(index, value) {
            this.powers[index] = value

            // On vérifie si un des sous bus a encore du courant
            // En effet, si un bus envoi qu'il n'a plus de courant mais qu'un
            // autre en a toujours, il faut continuer de montrer que le courant
            // passe
            const power = this.powers.filter((p) => p === true).length > 0
            this.$emit('power', power)
        },
        insulatorDraw(bus) {
            // Vecteur directeur
            const uv = this.multVector(this.unitVector(bus), -1)
            // Centre du cercle
            const center = this.projection(bus, bus.signal.insulator.dist, uv)

            return {
                cx: center.x,
                cy: center.y,
                r: this.insulatorRadius / 2,
            }
        },
        path(bus) {
            let str = `M ${this.x} ${this.y}`

            // Vecteur directeur
            const uv = this.unitVector(bus)

            for (const bridge of bus.bridges) {
                // Rayon du demi-cercle
                const r = bridge.size / 2
                // Début du pont
                const begin = this.projection(this, bridge.dist - r, uv)
                // Fin du pont
                const end = this.projection(begin, bridge.size, uv)
                // Si le vecteur va vers la droite, le pont sera "au dessus"
                // Si le vecteur va vers la gauche, le pont sera "en dessous"
                const swip = uv.x > 0 ? 1 : 0

                str += `L ${begin.x} ${begin.y} A ${r} ${r} 0 0 ${swip} ${end.x} ${end.y}`
            }

            str += `L ${bus.x} ${bus.y}`
            return str
        },
        pathForArrow(arrow, bus) {
            const angle =
                (!this.powerFromSignal * 180 + this.arrowAngle) *
                (Math.PI / 180.0)
            const cosA = Math.cos(angle)
            const sinA = Math.sin(angle)
            const cosB = Math.cos(-angle)
            const sinB = Math.sin(-angle)

            // Vecteur directeur
            const uv = this.unitVector(bus)
            // Vecteur première branche
            const av = {
                x: cosA * uv.x - sinA * uv.y,
                y: sinA * uv.x + cosA * uv.y,
            }
            // Vecteur seconde branche
            const bv = {
                x: cosB * uv.x - sinB * uv.y,
                y: sinB * uv.x + cosB * uv.y,
            }
            // Pointe de la flèche
            const center = this.projection(this, arrow.dist, uv)
            // Première branche
            const pointA = this.projection(center, this.arrowSize / 2, av)
            // Seconde branche
            const pointB = this.projection(center, this.arrowSize / 2, bv)

            return `M ${pointA.x} ${pointA.y} L ${center.x} ${center.y} L ${pointB.x} ${pointB.y}`
        },
        unitVector(bus) {
            // Vecteur du segment du bus
            const v = {
                x: bus.x - this.x,
                y: bus.y - this.y,
            }

            // Longueur du segment
            const s = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2))

            // Vecteur unitaire
            return {
                x: v.x / s,
                y: v.y / s,
            }
        },
        projection(startingPoint, distance, unitVector) {
            return {
                x: distance * unitVector.x + startingPoint.x,
                y: distance * unitVector.y + startingPoint.y,
            }
        },
        multVector(v, t) {
            return {
                x: v.x * t,
                y: v.y * t,
            }
        },
    },
}
</script>

<style scoped></style>
