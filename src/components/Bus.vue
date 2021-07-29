<template>
    <template v-for="(n, index) of next" :key="index">
        <path
            :d="path(n)"
            :stroke="color"
            :class="powers[index] ? 'path' : ''"
            :stroke-dasharray="powers[index] ? '8 4' : 0"
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
</template>

<script>
import Bus from '@/models/bus-model'

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
        power: {
            type: Boolean,
            default: false,
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
            powerSpeed: 40,
        }
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
            str += `L ${n.x} ${n.y}`
            return str
        },
    },
}
</script>

<style scoped></style>
