<template>
    <g :transform="transform">
        <rect
            x="0"
            y="0"
            :width="width"
            :height="height"
            :fill="color"
            :stroke="strokeColor"
        ></rect>
        <text :x="raPoint.x" :y="raPoint.y">{{ ra.toString() }}</text>
    </g>
</template>

<script>
import Integer from '@/integer'
import Helper from '@/helper'
import architectureStyle from '@/view-datas/architecture-style.json'

export default {
    name: 'Formatter',
    props: {
        ra: Integer,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
    },
    data() {
        return {
            fontSize: architectureStyle.fontSize,
            color: architectureStyle.formatterColor,
            strokeColor: architectureStyle.elementStrokeColor,
        }
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
