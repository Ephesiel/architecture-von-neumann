<template>
    <text
        :x="x"
        :y="y"
        :fill="isActive ? activeSignalColor : inactiveSignalColor"
        >{{ name }}
        <slot></slot>
    </text>
</template>

<script>
import Helper from '@/helper'
import { Signals } from '@/globals'
import architectureStyle from '@/view-datas/architecture-style.json'

export default {
    props: {
        x: Number,
        y: Number,
        signal: [String, Number],
    },
    data() {
        return {
            inactiveSignalColor: architectureStyle.inactiveSignalColor,
            activeSignalColor: architectureStyle.activeSignalColor,
        }
    },
    computed: {
        key() {
            return typeof this.signal === Number
                ? this.signal
                : Signals[this.signal]
        },
        name() {
            return Helper.getSignalName(this.key)
        },
        isActive() {
            return this.$store.state.engine.signals[this.key]
        },
    },
}
</script>
