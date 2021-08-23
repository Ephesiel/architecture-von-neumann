<template>
    <g :transform="transform" class="instruction-register">
        <Formatter
            :ra="ra"
            :x="0"
            :y="-formatterHeight"
            :width="width"
            :height="formatterHeight"
        />
        <Register :register-model="registerModel" :datas="registerDatas" />
        <Sequencer :sequencer-model="sequencerModel" />
    </g>
</template>

<script>
import Register from '@/components/Register.vue'
import Formatter from '@/components/Formatter.vue'
import Sequencer from '@/components/Sequencer.vue'
import RegisterDecorator from '@/models/registers/register-decorator'
import SequencerModel from '@/models/sequencer'
import Helper from '@/helper'

export default {
    name: 'InstructionRegister',
    props: {
        registerModel: RegisterDecorator,
        sequencerModel: SequencerModel,
        datas: { type: Object, default: () => {} },
    },
    data() {
        return {
            instructionRegister: null,
        }
    },
    components: {
        Register,
        Formatter,
        Sequencer,
    },
    computed: {
        x() {
            return Helper.verifyValue(this.datas.x, 'number')
        },
        y() {
            return Helper.verifyValue(this.datas.y, 'number')
        },
        width() {
            return Helper.verifyValue(this.datas.w, 'number')
        },
        height() {
            return Helper.verifyValue(this.datas.h, 'number')
        },
        registerDatas() {
            return {
                x: 0,
                y: 0,
                w: this.width,
                h: this.height,
            }
        },
        transform() {
            return Helper.transform(this.x, this.y)
        },
        formatterHeight() {
            return 0.4 * this.height
        },
        ra() {
            return this.instructionRegister.getRA()
        },
    },
    created() {
        let reg = this.registerModel
        while (reg instanceof RegisterDecorator) {
            reg = reg.register
        }
        this.instructionRegister = reg
    },
}
</script>

<style lang="scss"></style>
