<template>
    <g :transform="transform" class="instruction-register">
        <Formatter
            :ra="ra"
            :x="0"
            :y="-formatterHeight"
            :width="width"
            :height="formatterHeight"
            :font-size="fontSize"
        />
        <Register
            :register-model="registerModel"
            :width="width"
            :height="height"
            :x="0"
            :y="0"
            :font-size="fontSize"
        />
        <Sequencer :sequencer-model="sequencerModel" :font-size="fontSize" />
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
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        fontSize: Number,
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
