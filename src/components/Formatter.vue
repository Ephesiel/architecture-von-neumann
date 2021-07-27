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
            :font-size="raFontSize"
            fill="black"
            >{{ ra.toString() }}</text
        >
        <!-- Sequencer -->
    </g>
</template>

<script>
import Integer, { maxOf, SIGNED } from '@/integer'
import { NB_BITS_ARCH } from '@/globals'
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
    data() {
        return {
            police: 'arial',
        }
    },
    computed: {
        transform() {
            return Helper.transform(this.x, this.y)
        },
        margin() {
            return this.height * 0.1
        },
        raFontSize() {
            return Helper.calculateFontSize(
                maxOf(NB_BITS_ARCH, SIGNED),
                this.width,
                this.height - this.margin
            )
        },
        raSize() {
            return Helper.calculateSize(
                this.ra.toString(),
                `${this.raFontSize}px ${this.police}`
            )
        },
        raPoint() {
            const size = this.raSize
            return {
                x: this.width / 2 - size.w / 2,
                y: this.raSize.h,
            }
        },
    },
}
</script>

<style lang="scss"></style>
