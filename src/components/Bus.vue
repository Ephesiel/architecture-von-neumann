<template>
    <template v-for="(n, index) of next" :key="index">
        <path
            :d="path(n)"
            :stroke="color"
            :class="powers[index] ? 'path' : ''"
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
        <Bus ref="test" v-bind="n" @power="onPower(index, $event)" />
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

export default {
    emits: ['power'],
    props: {
        name: { type: String, default: '' },
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        next: { type: Array, default: () => [] },
        bridges: { type: Array, default: () => [] },
        labels: { type: Array, default: () => [] },
        signal: { type: Object, default: () => null },
        powerFromSignal: { type: Boolean, default: true },
        color: { type: String, default: 'black' },
    },
    data() {
        return {
            powers: [],
            powerSpeed: 60,
        }
    },
    computed: {
        power() {
            console.log(this.labels, this.name)
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
                // Début du pont
                const begin = this.projection(this, bridge.dist, uv)
                // Fin du pont
                const end = this.projection(begin, bridge.size, uv)
                // Rayon du demi-cercle
                const r = bridge.size / 2
                // Si le vecteur va vers la droite, le pont sera "au dessus"
                // Si le vecteur va vers la gauche, le pont sera "en dessous"
                const swip = uv.x > 0 ? 1 : 0

                str += `L ${begin.x} ${begin.y} A ${r} ${r} 0 0 ${swip} ${end.x} ${end.y}`
            }

            str += `L ${n.x} ${n.y}`
            return str
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
