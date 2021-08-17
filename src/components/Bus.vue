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
        <Bus ref="test" v-bind="n" @power="onPower(index, $event)" />
    </template>
    <text
        :x="x + 2"
        :y="y + 1 * (powerFromSignal ? -1 : 1)"
        v-if="signal !== ''"
        >{{ signal }}</text
    >
</template>

<script>
import Bus from '@/models/bus-model'
import { Signals } from '@/globals'

export default {
    emits: ['power'],
    props: {
        model: {
            type: Bus,
            required: true,
        },
        x: {
            type: Number,
            default: 0,
        },
        y: {
            type: Number,
            default: 0,
        },
        next: {
            type: Array,
            default: () => [],
        },
        bridges: {
            type: Array,
            default: () => [],
        },
        signal: {
            type: String,
            default: '',
        },
        powerFromSignal: {
            type: Boolean,
            default: true,
        },
        color: {
            type: String,
            default: 'black',
        },
    },
    data() {
        return {
            powers: [],
            powerSpeed: 60,
        }
    },
    computed: {
        power() {
            return this.sig === ''
                ? false
                : this.$store.state.signals[Signals[this.signal]]
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
            // autre en a toujours, il faut continuer de dire que le courant
            // passe
            const power = this.powers.filter((p) => p === true).length > 0
            this.$emit('power', power)
        },
        path(n) {
            let str = `M ${this.x} ${this.y}`

            // Vecteur de la droite
            let vx = n.x - this.x
            let vy = n.y - this.y

            // Distance totale de la droite
            let dv = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2))

            // Vecteur unitaire
            let ux = vx / dv
            let uy = vy / dv

            for (const bridge of n.bridges) {
                // Début du pont
                let xb = bridge.dist * ux + this.x
                let yb = bridge.dist * uy + this.y

                // Fin du pont
                let xe = xb + bridge.size * ux
                let ye = yb + bridge.size * uy

                let r = bridge.size / 2
                let swip = ux > 0 ? 1 : 0

                str += `L ${xb} ${yb} A ${r} ${r} 0 0 ${swip} ${xe} ${ye}`

                console.log(xb, yb, xe, ye)
            }

            str += `L ${n.x} ${n.y}`
            return str
        },
    },
}
</script>

<style scoped></style>
