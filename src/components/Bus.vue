<template>
    <template v-for="(n, index) of next" :key="index">
        <line
            :x1="x"
            :y1="y"
            :x2="n.x"
            :y2="n.y"
            :stroke="getColor(index)"
            stroke-width="3"
        />
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
        color: {
            type: String,
            default: 'black',
        },
    },
    data() {
        return {
            powers: [],
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
            this.$emit('power', power && this.model.hasPower())
        },
        getColor(index) {
            return typeof this.powers[index] !== 'undefined' &&
                this.powers[index]
                ? 'red'
                : this.color
        },
    },
}
</script>
