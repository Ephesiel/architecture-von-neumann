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
import architectureStyle from '@/view-datas/architecture-style.json'
import Helper from '@/helper'

export default {
    name: 'Multiplexer',
    props: {
        multiplexerModel: MultiplexerModel,
        x: Number,
        y: Number,
        width: Number,
    },
    data() {
        return {
            path: '',
            places: [],
            fontSize: architectureStyle.fontSize,
        }
    },
    computed: {
        transform() {
            return Helper.transform(this.x, this.y)
        },
        numberSize() {
            return Helper.calculateSize(
                this.multiplexerModel.getNumberOfValueBuses().toString(),
                this.fontSize
            )
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
            const height = this.places[this.places.length - 1] + 2 * y
            str += ` v ${y} h ${this.numberSize.w} l ${
                this.width - this.numberSize.w
            } -${height / 2 - y} v -${y / 2} l -${
                this.width - this.numberSize.w
            } -${height / 2 - y} Z`
            return str
        },
    },
    beforeMount() {
        this.path = this.createPath()
    },
}
</script>
