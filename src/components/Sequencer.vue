<template>
    <g>
        <component
            v-for="(register, index) of registers"
            :key="index"
            :is="register.type"
            v-bind="register"
        ></component>

        <Multiplexer
            v-for="(mult, index) of multiplexers"
            :key="index"
            v-bind="mult"
        ></Multiplexer>

        <text
            v-for="(text, index) of texts"
            :key="index"
            :x="text.x"
            :y="text.y"
            :style="text.style"
            >{{ text.content }}</text
        >

        <Memory v-bind="memory" />
    </g>
</template>

<script>
import SequencerModel from '@/models/sequencer'
import MMParser from '@/microprogrammed-memory-parser'
import Register from '@/components/Register.vue'
import Multiplexer from '@/components/Multiplexer.vue'
import Memory from '@/components/Memory.vue'
import sequencerData from '@/view-datas/sequencer.json'
//import architectureStyle from '@/view-datas/architecture-style.json'
import { getJsonValues } from '@/functions'
import Helper from '@/helper'
import Integer from '@/integer'

export default {
    name: 'Sequencer',
    props: {
        sequencerModel: SequencerModel,
    },
    components: {
        Multiplexer,
        Memory,
        Register,
    },
    computed: {
        registers() {
            const registers = getJsonValues(sequencerData, 'registers')

            return registers.map((register) => {
                let reg = {
                    registerModel: this.sequencerModel[register.model],
                    datas: register,
                    type: register.type,
                }

                return reg
            })
        },
        multiplexers() {
            const multiplexers = getJsonValues(sequencerData, 'multiplexers')

            return multiplexers.map((mult) => {
                let m = {
                    multiplexerModel: this.sequencerModel[mult.model],
                    x: mult.x,
                    y: mult.y,
                }

                return m
            })
        },
        texts() {
            const texts = getJsonValues(sequencerData, 'texts')

            return texts.map((text) => {
                let content = text.content
                if (text.dynamic) {
                    content = this.sequencerModel
                    let st = 0
                    while (text.content.indexOf('.', st) !== -1) {
                        let index = text.content.indexOf('.', st)
                        content = content[text.content.substr(st, index - st)]
                        st = index + 1
                    }
                    content = content[text.content.substr(st)]

                    if (content instanceof Integer) {
                        content = content.toNumber()
                    }
                }

                const t = {
                    content: content,
                    x: text.x,
                    y: text.y,
                    style: {
                        font: text.font + ' ' + Helper.police,
                        border:
                            text.border.length > 0
                                ? `0.1rem solid ${text.border}`
                                : '',
                        textColor: text.color,
                        backgroundColor: text.background,
                    },
                }

                return t
            })
        },
        memory() {
            return {
                ...getJsonValues(sequencerData, 'memory')[0],
                memoryModel: this.sequencerModel.microprogammedMemory,
                dataProcessor: MMParser.translate,
            }
        },
    },
}
</script>
