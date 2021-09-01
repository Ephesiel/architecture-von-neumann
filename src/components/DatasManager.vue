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
        <text font-weight="bold" :x="center.x" :y="center.y">{{ text }}</text>
    </g>
</template>

<script>
import Helper from '@/helper'
import { verifyValue } from '@/functions'
import architectureStyle from '@/view-datas/architecture-style.json'

export default {
    name: 'Formatter',
    props: {
        datas: { type: Object, default: () => {} },
    },
    data() {
        return {
            fontSize: architectureStyle.fontSize,
            color: architectureStyle.datasManagerColor,
            strokeColor: architectureStyle.elementStrokeColor,
        }
    },
    computed: {
        x() {
            return verifyValue(this.datas.x, 'number')
        },
        y() {
            return verifyValue(this.datas.y, 'number')
        },
        width() {
            return verifyValue(this.datas.w, 'number')
        },
        height() {
            return verifyValue(this.datas.h, 'number')
        },
        text() {
            return verifyValue(this.datas.text, 'string', 'Datas manager')
        },
        transform() {
            return Helper.transform(this.x, this.y)
        },
        center() {
            return {
                x: this.width / 2,
                y: this.height / 2,
            }
        },
    },
}
</script>

<style lang="scss"></style>
