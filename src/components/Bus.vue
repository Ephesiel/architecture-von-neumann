<template>
    <template v-for="(n, index) of next" :key="index">
        <path
            :d="path(n)"
            :stroke="color"
            :stroke-dasharray="powers[index] ? '1 0.5' : 0"
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
            v-if="n.signal !== null && n.signal.insulator !== null"
            v-bind="insulatorDraw(n)"
            :fill="powers[index] ? 'green' : 'red'"
            stroke="black"
        />
        <path
            v-for="(arrow, indexArrow) of n.arrows"
            :key="indexArrow"
            :d="pathForArrow(arrow, n)"
            :stroke="color"
            fill="none"
        />
        <Bus :datas="n" @power="onPower(index, $event)" />
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
import Helper from '@/helper'

export default {
    emits: ['power'],
    props: {
        datas: { type: Object, default: () => {} },
    },
    data() {
        return {
            powers: [],
            powerSpeed: 60,
        }
    },
    computed: {
        name() {
            return Helper.verifyValue(this.datas.name, 'string', 'Bus unamed')
        },
        x() {
            return Helper.verifyValue(this.datas.x, 'number')
        },
        y() {
            return Helper.verifyValue(this.datas.y, 'number')
        },
        color() {
            return Helper.verifyValue(this.datas.color, 'string', 'black')
        },
        powerFromSignal() {
            return Helper.verifyValue(this.datas.powerFromSignal, 'boolean')
        },
        signal() {
            const signal = Helper.verifyValue(this.datas.signal, 'object')

            if (signal !== null) {
                signal.name = Helper.verifyValue(signal.name, 'string')
                signal.x = Helper.verifyValue(signal.x, 'number')
                signal.y = Helper.verifyValue(signal.y, 'number')
                signal.insulator = Helper.verifyValue(
                    signal.insulator,
                    'object'
                )

                if (signal.insulator !== null) {
                    signal.insulator.dist = Helper.verifyValue(
                        signal.insulator.dist,
                        'number'
                    )
                    signal.insulator.size = Helper.verifyValue(
                        signal.insulator.size,
                        'number',
                        1
                    )
                }
            }

            return signal
        },
        labels() {
            const labels = Helper.verifyValue(this.datas.labels, 'array')

            for (const label of labels) {
                label.x = Helper.verifyValue(label.x, 'number')
                label.y = Helper.verifyValue(label.y, 'number')
            }

            return labels
        },
        arrows() {
            const arrows = Helper.verifyValue(this.datas.arrows, 'array')

            for (const arrow of arrows) {
                arrow.dist = Helper.verifyValue(arrow.dist, 'number')
                arrow.size = Helper.verifyValue(arrow.size, 'number', 1)
                arrow.angle = Helper.verifyValue(arrow.angle, 'number', 40)
            }

            return arrows
        },
        next() {
            const next = Helper.verifyValue(this.datas.next, 'array')

            for (const subBus of next) {
                subBus.name = this.name
                subBus.color = this.color
                subBus.powerFromSignal = this.powerFromSignal
                subBus.x += this.x
                subBus.y += this.y
            }

            return next
        },
        bridges() {
            const bridges = Helper.verifyValue(this.datas.bridges, 'array')

            for (const bridge of bridges) {
                bridge.dist = Helper.verifyValue(bridge.dist, 'number')
                bridge.size = Helper.verifyValue(bridge.size, 'number', 1)
            }

            bridges.sort((b1, b2) => {
                return b1.dist > b2.dist ? 1 : b1.dist < b2.dist ? -1 : 0
            })

            return bridges
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
                fill: this.power ? 'red' : 'black',
            }
        },
    },
    watch: {
        power: function () {
            this.$emit('power', this.power)
        },
    },
    methods: {
        onPower(index, value) {
            this.powers[index] = value

            // On vérifie si un des sous bus a encore du courant
            // En effet, si un bus envoi qu'il n'a plus de courant mais qu'un
            // autre en a toujours, il faut continuer de montrer que le courant
            // passe
            const power = this.powers.filter((p) => p === true).length > 0
            this.$emit('power', power)
        },
        insulatorDraw(n) {
            // Vecteur directeur
            const uv = this.unitVector(n)
            // Centre du cercle
            const center = this.projection(this, n.signal.insulator.dist, uv)

            return {
                cx: center.x,
                cy: center.y,
                r: n.signal.insulator.size / 2,
            }
        },
        path(n) {
            let str = `M ${this.x} ${this.y}`

            // Vecteur directeur
            const uv = this.unitVector(n)

            for (const bridge of n.bridges) {
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

            str += `L ${n.x} ${n.y}`
            return str
        },
        pathForArrow(arrow, n) {
            const angle =
                (!this.powerFromSignal * 180 + arrow.angle) * (Math.PI / 180.0)
            const cosA = Math.cos(angle)
            const sinA = Math.sin(angle)
            const cosB = Math.cos(-angle)
            const sinB = Math.sin(-angle)

            // Vecteur directeur
            const uv = this.unitVector(n)
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
            const pointA = this.projection(center, arrow.size / 2, av)
            // Seconde branche
            const pointB = this.projection(center, arrow.size / 2, bv)

            return `M ${pointA.x} ${pointA.y} L ${center.x} ${center.y} L ${pointB.x} ${pointB.y}`
        },
        unitVector(n) {
            // Vecteur du segment du bus
            const v = {
                x: n.x - this.x,
                y: n.y - this.y,
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
    },
}
</script>

<style scoped></style>
