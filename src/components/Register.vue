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
            :font-size="fontSize"
            fill="black"
            class="label"
            >{{ label }}</text
        >
        <text
            :x="currentValuePoint.x"
            :y="currentValuePoint.y"
            :font-size="fontSize"
            fill="black"
            >{{ formatCurrentValue }}</text
        >
        <text
            :x="nextValuePoint.x"
            :y="nextValuePoint.y"
            :font-size="fontSize"
            fill="black"
            >{{ formatNextValue }}</text
        >
        <text
            :x="currentValueBinaryPoint.x"
            :y="currentValueBinaryPoint.y"
            :font-size="fontSize"
            fill="black"
            >{{ formatCurrentValueBinary }}</text
        >
        <text
            :x="nextValueBinaryPoint.x"
            :y="nextValueBinaryPoint.y"
            :font-size="fontSize"
            fill="black"
            >{{ formatNextValueBinary }}</text
        >
    </g>
</template>

<script>
import { maxOf } from '@/integer'
import RegisterModel from '@/models/registers/register-model'
import Helper from '@/helper'

export default {
    label: 'Register',
    props: {
        registerModel: RegisterModel,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        labelPos: {
            type: String,
            default: 'L',
        },
    },
    data: function () {
        return {
            rows: 2,
            color: 'rgb(249, 240, 157)',
        }
    },
    computed: {
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
        fontSize() {
            // On veut que tous les éléments aient la même taille de police.
            // Ainsi, on prend le minimum des tailles maximum possible pour
            // chaque composant.
            return Math.min(
                Helper.calculateFontSize(
                    this.formatCurrentValueBinary,
                    this.componentsWidth.binary - this.margins.lr,
                    this.height / this.rows - this.margins.ud
                ),
                Helper.calculateFontSize(
                    maxOf(
                        this.registerModel.getCurrentValue().size,
                        this.registerModel.getCurrentValue().signed
                    ),
                    this.componentsWidth.decimal - this.margins.lr,
                    this.height / this.rows - this.margins.ud
                ),
                Helper.calculateFontSize(
                    this.label,
                    this.height - this.margins.ud,
                    this.componentsWidth.label - this.margins.lr
                )
            )
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
