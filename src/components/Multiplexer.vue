<template>
    <g :transform="transform">
        <path :d="path" stroke="black" stroke-width="2px" fill="transparent" />
        <text
            v-for="(e, i) in this.multiplexerModel
                .getNumberOfValueBuses()
                .toNumber()"
            :key="i"
            :font-size="fontSize"
            :x="calcX"
            :y="places[i]"
            >{{ i }}</text
        >
    </g>
</template>

<script>
import MultiplexerModel from '@/models/multiplexer-model'
import Helper from '@/helper'

export default {
    name: 'Multiplexer',
    props: {
        multiplexerModel: MultiplexerModel,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
    },
    data() {
        return {
            path: '',
            places: [],
        }
    },
    computed: {
        transform() {
            return Helper.transform(this.x, this.y)
        },
        fontSize() {
            return Helper.calculateFontSize(
                '0',
                this.width,
                this.height /
                    (2 *
                        this.multiplexerModel
                            .getNumberOfValueBuses()
                            .toNumber())
            )
        },
        numberSize() {
            return Helper.calculateSize('0', this.fontSize)
        },
        calcX() {
            return 2 + this.numberSize.w / 2
        },
    },
    methods: {
        createPath() {
            let str = 'm0 0'
            const y = this.numberSize.h
            let totY = 0
            for (
                let i = 0;
                i < this.multiplexerModel.getNumberOfValueBuses() - 1;
                ++i
            ) {
                str += ` v ${y} l ${this.numberSize.w} ${y / 2} l -${
                    this.numberSize.w
                } ${y / 2}`
                this.places.push(totY + y / 2)
                totY += 2 * y
            }
            this.places.push(totY + y / 2)
            str += ` v ${y} h ${this.numberSize.w} l ${
                this.width - this.numberSize.w
            } -${this.height / 2 - y / 1.5} v -${y / 2} l -${
                this.width - this.numberSize.w
            } -${this.height / 2 - y / 1.2} Z`
            return str
        },
    },
    beforeMount() {
        this.path = this.createPath()
    },
}
</script>
