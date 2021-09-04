<template>
    <g>
        <Bus v-for="(bus, index) of buses" :key="index" v-bind="bus" />
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

        <g
            v-for="(text, index) of texts"
            :key="index"
            :transform="`translate(${text.x}, ${text.y})`"
            :width="text.w"
            :height="text.h"
        >
            <rect
                v-if="text.border !== ''"
                :width="text.w"
                :height="text.h"
                :stroke="text.border"
                :fill="text.background"
                stroke-width="0.1"
            />
            <text
                :x="text.w / 2"
                :y="text.h / 2"
                v-if="text.content.indexOf('\n') > -1"
            >
                <tspan
                    v-for="line of text.content.split('\n')"
                    :key="line"
                    :x="text.w / 2"
                    dy="1"
                    >{{ line }}</tspan
                >
            </text>
            <text :x="text.w / 2" :y="text.h / 2" v-else>
                {{ text.content }}
            </text>
        </g>

        <Memory v-bind="memory" />
    </g>
</template>

<script>
import { getJsonValues } from '@/functions'
import { Signals } from '@/globals'
import Integer from '@/integer'
import MMParser from '@/microprogrammed-memory-parser'
import sequencerData from '@/view-datas/sequencer.json'
import SequencerModel from '@/models/sequencer'
import Register from '@/components/Register.vue'
import Bus from '@/components/Bus.vue'
import Multiplexer from '@/components/Multiplexer.vue'
import Memory from '@/components/Memory.vue'

export default {
    name: 'Sequencer',
    props: {
        sequencerModel: SequencerModel,
    },
    components: {
        Multiplexer,
        Memory,
        Register,
        Bus,
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
                        content = content.toString()
                    }
                }

                const t = {
                    content: content,
                    x: text.x,
                    y: text.y,
                    w: text.w,
                    h: text.h,
                    border: text.border === 'none' ? '' : text.border,
                    background: text.background,
                    color: text.color,
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
        buses() {
            return getJsonValues(sequencerData, 'buses').map((bus) => {
                return {
                    model1:
                        bus.model !== ''
                            ? this.sequencerModel[bus.model]
                            : null,
                    model2:
                        bus.model2 !== ''
                            ? this.sequencerModel[bus.model2]
                            : null,
                    hasPower: this.busHasPower,
                    datas: bus,
                }
            })
        },
    },
    methods: {
        busHasPower(bus) {
            if (bus.model1 === null) {
                return 1
            }

            let result = 0

            const powerBus = this.$store.state.engine.powerBus
            const signals = this.$store.state.engine.signals
            const model1Power = powerBus.includes(bus.model1)

            const phaseMultVal =
                this.sequencerModel.phaseMult.selectorBus.getValue()
            const nextAddrMultVal =
                this.sequencerModel.nextAddrMult.selectorBus.getValue()
            const conditionMultVal =
                this.sequencerModel.conditiontMult.selectorBus.getValue()

            const phaseMultPower = signals[Signals.eRAMM]
            const nextAddrMultPower = phaseMultVal.eq(0) && phaseMultPower
            const conditionMultPower =
                nextAddrMultVal.eq(1) && nextAddrMultPower

            if (model1Power) {
                switch (bus.model1) {
                    case this.sequencerModel.busInputMM:
                        result =
                            signals[Signals.eREMM] ||
                            (conditionMultPower && conditionMultVal.eq(0)) ||
                            (nextAddrMultPower && nextAddrMultVal.eq(0))
                        break
                    case this.sequencerModel.busOutputMM:
                        result = signals[Signals.eREMM]
                        break
                    case this.sequencerModel.busOutputPlus1:
                        result =
                            (conditionMultPower && conditionMultVal.eq(0)) ||
                            (nextAddrMultPower && nextAddrMultVal.eq(0))
                        break
                    case this.sequencerModel.busOutputConditionMult:
                        result = conditionMultPower
                        break
                    case this.sequencerModel.busInputCOPMA:
                        result = nextAddrMultPower && nextAddrMultVal.eq(2)
                        break
                    case this.sequencerModel.busOutputPhase:
                    case this.sequencerModel.busOutputPhaseMult:
                        result = phaseMultPower
                        break
                    case this.sequencerModel.busSelMS:
                    case this.sequencerModel.busOutputNextAddrMult:
                        result = nextAddrMultPower
                        break
                    case this.sequencerModel.busOutputFetch:
                        result = phaseMultPower && phaseMultVal.eq(1)
                        break
                }
            }

            return result
        },
    },
}
</script>

<style lang="scss" scoped>
.seqText {
    line-height: 1.1;
}
</style>
