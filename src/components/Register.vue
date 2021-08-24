<template>
    <g :transform="transform" class="register">
        <rect
            :x="rectX"
            y="0"
            :width="width - componentsWidth.label"
            :height="height"
            :fill="color"
            stroke="black"
        ></rect>
        <rect
            :x="labelRectX"
            y="0"
            :width="componentsWidth.label"
            :height="height"
            :fill="color"
            stroke="black"
        ></rect>
        <text
            :transform="labelTransform"
            :x="labelPoint.x"
            :y="labelPoint.y"
            fill="black"
            class="label"
            >{{ label }}</text
        >
        <text :x="currentValuePoint.x" :y="currentValuePoint.y" fill="black">{{
            formatCurrentValue
        }}</text>
        <text :x="nextValuePoint.x" :y="nextValuePoint.y" fill="black">{{
            formatNextValue
        }}</text>
        <text
            :x="currentValueBinaryPoint.x"
            :y="currentValueBinaryPoint.y"
            fill="black"
            >{{ formatCurrentValueBinary }}</text
        >
        <text
            :x="nextValueBinaryPoint.x"
            :y="nextValueBinaryPoint.y"
            fill="black"
            >{{ formatNextValueBinary }}</text
        >
    </g>
</template>

<script>
import RegisterModel from '@/models/registers/register-model'
import Helper from '@/helper'
import { verifyValue } from '@/functions'

export default {
    label: 'Register',
    props: {
        registerModel: RegisterModel,
        datas: { type: Object, default: () => {} },
    },
    data: function () {
        return {
            rows: 2,
            color: 'rgb(249, 240, 157)',
            fontSize: this.$store.state.architecture.fontSize,
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
        labelPos() {
            return verifyValue(this.datas.labelPos, 'string', 'L')
        },
        componentsWidth() {
            return {
                label: 0.1 * this.width,
                decimal: 0.25 * this.width,
                binary: 0.65 * this.width,
            }
        },
        margins() {
            // Doit être computed car utilise les données
            return {
                ud: 0,
                lr: 0,
            }
        },
        transform() {
            return Helper.transform(this.x, this.y)
        },
        labelTransform() {
            return `rotate(${this.labelPos === 'L' ? -90 : 90} ${
                this.componentsWidth.label / 2
            } ${this.height / 2}) translate(${
                this.labelPos === 'L'
                    ? '0 0'
                    : `0 ${-(this.width - this.componentsWidth.label)}`
            })`
        },
        formatCurrentValueBinary() {
            return this.registerModel.getCurrentValue().toBinary()
        },
        formatNextValueBinary() {
            return this.registerModel.getNextValue().toBinary()
        },
        formatCurrentValue() {
            return this.registerModel.getCurrentValue().toString()
        },
        formatNextValue() {
            return this.registerModel.getNextValue().toString()
        },
        label() {
            return this.registerModel.getName()
        },
        labelRectX() {
            return this.labelPos === 'L'
                ? 0
                : this.width - this.componentsWidth.label
        },
        rectX() {
            return this.labelPos === 'L' ? this.componentsWidth.label : 0
        },
        valueSize() {
            return Helper.calculateSize(this.formatCurrentValue, this.fontSize)
        },
        nextValueSize() {
            return Helper.calculateSize(this.formatNextValue, this.fontSize)
        },
        binaryValueSize() {
            return Helper.calculateSize(
                this.formatCurrentValueBinary,
                this.fontSize
            )
        },
        labelSize() {
            return Helper.calculateSize(this.label, this.fontSize)
        },
        overhead() {
            return (this.height - 2 * this.binaryValueSize.h) / 2
        },
        currentValuePoint() {
            const size = this.valueSize
            return {
                x: this.decimalX,
                y: this.calcY(0, size),
            }
        },
        nextValuePoint() {
            const size = this.nextValueSize
            return {
                x: this.decimalX,
                y: this.calcY(1, size),
            }
        },
        labelPoint() {
            return {
                x: this.componentsWidth.label / 2,
                y: this.height / 2,
            }
        },
        currentValueBinaryPoint() {
            const size = this.binaryValueSize
            return {
                x: this.binaryX,
                y: this.calcY(0, size),
            }
        },
        nextValueBinaryPoint() {
            const size = this.binaryValueSize
            return {
                x: this.binaryX,
                y: this.calcY(1, size),
            }
        },
        decimalX() {
            return this.calcX(
                this.componentsWidth.label + this.componentsWidth.decimal / 2
            )
        },
        binaryX() {
            return this.calcX(this.width - this.componentsWidth.binary / 2)
        },
    },
    methods: {
        calcY(n, size) {
            return this.overhead + n * this.binaryValueSize.h + size.h / 2
        },
        calcX(val) {
            if (this.labelPos === 'R') {
                return this.width - val
            }
            return val
        },
    },
}
</script>

<style lang="scss" scoped></style>
