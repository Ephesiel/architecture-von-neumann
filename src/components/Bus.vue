<template>
    <path :d="path" :stroke="color" stroke-width="3" fill="none" />
    <path :d="powerPath" stroke="blue" stroke-width="3" fill="none" />
    <!-- <text x="0" y="20">{{ fromSig }}</text> -->
</template>

<script>
import Bus from '@/models/bus-model'

export default {
    props: {
        model: {
            type: Bus,
            required: true,
        },
        points: {
            type: Object,
            required: true,
        },
        color: {
            type: String,
            default: 'black',
        },
    },
    computed: {
        fromSig() {
            console.log(this.$store.state.signals)
            return Object.values(this.$store.state.signals)
        },
        path() {
            return (
                `M ${this.points.x} ${this.points.y} ` +
                this.getPathFrom(this.points)
            )
        },
        powerPath() {
            return ''
        },
    },
    methods: {
        getPathFrom(point) {
            let str = `L ${point.x} ${point.y} `

            if (typeof point.connections !== 'undefined') {
                for (const connection of point.connections) {
                    str += this.getPathFrom(connection)
                    str += `L ${point.x} ${point.y}`
                }
            } else {
                //console.log(point.sig)
            }

            return str
        },
    },
}
</script>

<style lang="scss"></style>
