<template>
    <template v-for="(n, index) of next" :key="index">
        <line
            :x1="x"
            :y1="y"
            :x2="n.x"
            :y2="n.y"
            :stroke="getColor(index)"
            stroke-width="3"
            ref="test"
        />
        <Bus v-bind="n" @power="onPower(index, $event)" />
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
    },
    data() {
        return {
            color: 'black',
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
            this.$emit('power', value)
        },
        getColor(index) {
            return typeof this.powers[index] !== 'undefined' &&
                this.powers[index]
                ? 'red'
                : 'black'
        },
    },
}
</script>
