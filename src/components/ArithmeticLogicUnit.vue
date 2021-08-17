<template>
    <g :transform="transform">
        <rect
            :width="width"
            :height="height"
            :fill="color"
            stroke="black"
        ></rect>
        <text
            v-for="(l, index) of letters"
            :key="index"
            :x="l.x"
            :y="l.y"
            :font-size="fontSize"
            >{{ l.letter }}</text
        >
        <text :x="valuePoint.x" :y="valuePoint.y" :font-size="fontSize">{{
            formatValue
        }}</text>
        <text
            :x="binaryValuePoint.x"
            :y="binaryValuePoint.y"
            :font-size="fontSize"
        >
            <tspan :x="binaryValuePoint.x">{{ firstDigits }}</tspan>
            <tspan :x="binaryValuePoint.x" :dy="fontSize">{{
                lastDigits
            }}</tspan>
        </text>
        <rect
            :width="signalRectSize.w"
            :height="signalRectSize.h"
            :x="signalRectPoint.x"
            :y="signalRectPoint.y"
            fill="white"
            stroke="black"
        ></rect>
        <text
            v-for="(op, index) of operations"
            :key="index"
            :x="signalPoint(index).x"
            :y="signalPoint(index).y"
            :font-size="fontSize"
            :fill="op.color"
            >{{ op.name }}
            <title>{{ op.description }}</title>
        </text>
    </g>
</template>

<script>
import ALUModel from '@/models/arithmetic-logic-unit-model'
import Helper from '@/helper'

export default {
    name: 'ArithmeticLogicUnit',
    props: {
        aluModel: ALUModel,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        fontSize: Number,
        letters: Array,
    },
    data() {
        return {
            color: 'rgb(82, 187, 118)',
        }
    },
    computed: {
        operations() {
            let op = []
            for (const [signal, operation] of Object.entries(
                this.aluModel.getAllOperations()
            )) {
                op.push({
                    signal: signal,
                    name: Helper.getSignalName(signal),
                    description: operation.description,
                    color: this.$store.state.signals[signal] ? 'red' : 'black',
                })
            }

            return op
        },
        transform() {
            return Helper.transform(this.x, this.y)
        },
        formatValue() {
            return this.aluModel.getLastOutputedValue().toString()
        },
        formatValueBinary() {
            return this.aluModel.getLastOutputedValue().toBinary()
        },
        firstDigits() {
            const length = this.formatValueBinary.length
            return this.formatValueBinary.slice(0, length / 2)
        },
        lastDigits() {
            const length = this.formatValueBinary.length
            return this.formatValueBinary.slice(length / 2)
        },
        valueSize() {
            return Helper.calculateSize(this.formatValue, this.fontSize)
        },
        binaryValueSize() {
            return Helper.calculateSize(this.formatValueBinary, this.fontSize)
        },
        maxSignalSize() {
            let maxSize = { h: 0, w: 0 }

            for (const operation of this.operations) {
                const size = Helper.calculateSize(operation.name, this.fontSize)
                maxSize.h = Math.max(maxSize.h, size.h)
                maxSize.w = Math.max(maxSize.w, size.w)
            }

            return maxSize
        },
        valuePoint() {
            return {
                x: this.width / 2,
                y: this.height / 2 - this.valueSize.h / 2,
            }
        },
        binaryValuePoint() {
            return {
                x: this.width / 2,
                y: this.height / 2 + this.binaryValueSize.h,
            }
        },
        signalRectGap() {
            return this.width * 0.1
        },
        signalRectMargin() {
            return {
                left: this.fontSize,
                right: this.fontSize,
                top: this.maxSignalSize.h / 2,
                bot: this.maxSignalSize.h / 2,
            }
        },
        signalGap() {
            return this.maxSignalSize.h / 4
        },
        signalRectSize() {
            return {
                h:
                    this.maxSignalSize.h * this.operations.length +
                    this.signalGap * (this.operations.length - 1) +
                    this.signalRectMargin.top +
                    this.signalRectMargin.bot,
                w:
                    this.maxSignalSize.w +
                    this.signalRectMargin.left +
                    this.signalRectMargin.right,
            }
        },
        signalRectPoint() {
            return {
                x: -(this.signalRectSize.w + this.signalRectGap),
                y: (this.height - this.signalRectSize.h) / 2,
            }
        },
    },
    methods: {
        signalPoint(index) {
            return {
                x: this.signalRectPoint.x + this.signalRectSize.w / 2,
                y:
                    this.signalRectMargin.top +
                    this.signalRectPoint.y +
                    this.maxSignalSize.h * (index + 0.5) +
                    this.signalGap * index,
            }
        },
    },
}
</script>
