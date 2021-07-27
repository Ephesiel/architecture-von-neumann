<template>
    <g :transform="transform" class="register">
        <rect
            x="0"
            y="0"
            :width="width"
            :height="height"
            fill="transparent"
            stroke="black"
        ></rect>
        <text
            :x="namePoint.x"
            :y="namePoint.y"
            :font-size="nameFontSize"
            fill="black"
            >{{ name }}</text
        >
        <text
            :x="currentValuePoint.x"
            :y="currentValuePoint.y"
            :font-size="valueFontSize"
            fill="black"
            >{{ formatCurrentValue }}</text
        >
        <text
            :x="nextValuePoint.x"
            :y="nextValuePoint.y"
            :font-size="valueFontSize"
            fill="black"
            >{{ formatNextValue }}</text
        >
        <text
            :x="currentValueBinaryPoint.x"
            :y="currentValueBinaryPoint.y"
            :font-size="binaryValueFontSize"
            fill="black"
            >{{ formatCurrentValueBinary }}</text
        >
        <text
            :x="nextValueBinaryPoint.x"
            :y="nextValueBinaryPoint.y"
            :font-size="binaryValueFontSize"
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
    name: 'Register',
    props: {
        registerModel: RegisterModel,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
    },
    data: function () {
        return {
            nElements: 5,
            margin: 0.1,
            police: 'arial',
        }
    },
    computed: {
        transform() {
            return `translate(${this.x}, ${this.y})`
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
        name() {
            return this.registerModel.getName()
        },
        binaryValueFontSize() {
            return Helper.calculateFontSize(
                this.formatCurrentValueBinary,
                this.width,
                this.height / this.nElements -
                    (this.height / this.nElements) * this.margin
            )
        },
        valueFontSize() {
            return Helper.calculateFontSize(
                maxOf(
                    this.registerModel.getCurrentValue().size,
                    this.registerModel.getCurrentValue().signed
                ),
                this.width,
                this.height / this.nElements -
                    (this.height / this.nElements) * this.margin
            )
        },
        nameFontSize() {
            return Helper.calculateFontSize(
                this.name,
                this.width,
                this.height / this.nElements -
                    (this.height / this.nElements) * this.margin
            )
        },
        valueSize() {
            return Helper.calculateSize(
                this.formatCurrentValue,
                `${this.valueFontSize}px ${this.police}`
            )
        },
        binaryValueSize() {
            return Helper.calculateSize(
                this.formatCurrentValueBinary,
                `${this.binaryValueFontSize}px ${this.police}`
            )
        },
        nameSize() {
            return Helper.calculateSize(
                this.name,
                `${this.nameFontSize}px ${this.police}`
            )
        },
        currentValueBinaryPoint() {
            const size = this.binaryValueSize
            return {
                x: this.width / 2 - size.w / 2,
                y: this.overhead + size.h,
            }
        },
        currentValuePoint() {
            const size = this.valueSize
            return {
                x: this.width / 2 - size.w / 2,
                y: this.overhead + size.h + this.binaryValueSize.h,
            }
        },
        namePoint() {
            const size = this.nameSize
            return {
                x: this.width / 2 - size.w / 2,
                y:
                    this.overhead +
                    this.valueSize.h +
                    this.binaryValueSize.h +
                    size.h,
            }
        },
        nextValuePoint() {
            const size = this.valueSize
            return {
                x: this.width / 2 - size.w / 2,
                y:
                    this.overhead +
                    this.nameSize.h +
                    this.binaryValueSize.h +
                    size.h +
                    this.valueSize.h,
            }
        },
        nextValueBinaryPoint() {
            const size = this.binaryValueSize
            return {
                x: this.width / 2 - size.w / 2,
                y:
                    this.overhead +
                    this.nameSize.h +
                    this.binaryValueSize.h +
                    size.h +
                    2 * this.valueSize.h,
            }
        },
        overhead() {
            return (
                (this.height -
                    (this.nameSize.h +
                        2 * this.valueSize.h +
                        2 * this.binaryValueSize.h)) /
                2
            )
        },
    },
    methods: {},
}
</script>

<style lang="scss"></style>
