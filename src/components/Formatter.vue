<template>
    <g :transform="transform">
        <rect
            x="0"
            y="0"
            :width="width"
            :height="height"
            fill="transparent"
            stroke="black"
        ></rect>
        <text
            :x="raPoint.x"
            :y="raPoint.y"
            :font-size="$store.state.architecture.fontSize"
            fill="black"
            >{{ ra.toString() }}</text
        >
    </g>
</template>

<script>
import Integer from '@/integer'
import Helper from '@/helper'

export default {
    name: 'Formatter',
    props: {
        ra: Integer,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
    },
    computed: {
        transform() {
            return Helper.transform(this.x, this.y)
        },
        margin() {
            return this.height * 0.1
        },
        raPoint() {
            return {
                x: this.width / 2,
                y: this.height / 2,
            }
        },
    },
}
</script>

<style lang="scss"></style>
