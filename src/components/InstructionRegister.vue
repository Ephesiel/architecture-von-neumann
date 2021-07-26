<template>
    <g :transform="transform" class="instruction-register">
        <Formatter
            :ra="ra"
            :x="width * 0.1"
            :y="0"
            :width="width * 0.8"
            :height="registerTopMargin"
        />
        <Register
            :register-model="registerModel"
            :width="width"
            :height="registerHeight"
            :x="0"
            :y="registerTopMargin"
        />
    </g>
</template>

<script>
import Register from '@/components/Register.vue'
import Formatter from '@/components/Formatter.vue'
import RegisterDecorator from '@/models/registers/register-decorator'

export default {
    name: 'InstructionRegister',
    props: {
        registerModel: RegisterDecorator,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
    },
    data() {
        return {
            instructionRegister: null,
        }
    },
    components: {
        Register,
        Formatter,
    },
    computed: {
        transform() {
            return `translate(${this.x}, ${this.y})`
        },
        registerHeight() {
            return this.height - this.registerTopMargin
        },
        registerTopMargin() {
            return 0.2 * this.height
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
