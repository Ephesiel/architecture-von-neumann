<template>
    <template v-for="(n, index) of next" :key="index">
        <line
            :x1="x"
            :y1="y"
            :x2="n.x"
            :y2="n.y"
            :stroke="color"
            :class="powers[index] ? 'path' : ''"
            stroke-width="3"
        >
            <animate
                v-if="powers[index]"
                dur="20000s"
                repeatCount="indefinite"
                attributeName="stroke-dashoffset"
                fill="freeze"
                :by="20 * powerSpeed * 100 * (powerFromSignal ? 1 : -1) + '%'"
            />
        </line>
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
            default: [],
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
    },
}
</script>

<style scoped>
.path {
    stroke-dasharray: 8;
}
</style>
