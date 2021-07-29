<template>
    <!--
    <button @click="arch.stepByStep()">Pas à pas</button><br />
    <button @click="arch.phaseByPhase()">Phase par phase</button>-->
    <svg
        version="1.1"
        baseProfile="full"
        :width="realWidth"
        :height="realHeight"
        xmlns="http://www.w3.org/2000/svg"
    >
        <component
            v-for="(register, index) of registers"
            :key="index"
            :is="register.type"
            v-bind="register"
        ></component>

        <Bus v-for="(bus, index) of buses" :key="index" v-bind="bus" />
        Désolé, votre navigateur ne supporte pas le SVG.
    </svg>
    <button @click="stepByStep()">Pas à pas</button><br />
    <button @click="phaseByPhase()">Phase par phase</button>
</template>

<script>
import Architecture from '@/models/von-neumann-architecture-model'
import Register from '@/components/Register.vue'
import InstructionRegister from '@/components/InstructionRegister.vue'
import Bus from '@/components/Bus.vue'
import Signals from '@/signals'
import Clock from '@/models/clock'
import architectureData from '@/view-datas/architecture.json'
import Helper from '@/helper'

export default {
    name: 'Architecture',
    components: {
        Register,
        InstructionRegister,
        Bus,
    },
    data() {
        return {
            arch: new Architecture(),
            width: architectureData.size.width,
            height: architectureData.size.height,
        }
    },
    created() {
        Clock.register((UTA, signals) => {
            for (const signal of Object.keys(signals)) {
                if (signals[signal] > 0) {
                    this.$store.commit('addSignal', signal)
                }
            }
        })
    },
    computed: {
        registers() {
            const registers = Helper.getJsonValues(
                architectureData,
                'registers'
            )

            return registers.map(this.sanitizeRegister)
        },
        buses() {
            const buses = Helper.getJsonValues(architectureData, 'bus')
            return buses.map((bus) => {
                return this.sanitizeBus(bus)
            })
        },
        realWidth() {
            return this.pix(this.width)
        },
        realHeight() {
            return this.pix(this.height)
        },
        ratioCoordToPix() {
            return Math.min(
                this.$store.state.svgWidth / this.width,
                this.$store.state.svgHeight / this.height
            )
        },
    },
    methods: {
        pix(n) {
            return n * this.ratioCoordToPix
        },
        stepByStep() {
            this.$store.commit('resetSignals')
            this.arch.stepByStep()
        },
        phaseByPhase() {
            this.$store.commit('resetSignals')
            this.arch.phaseByPhase()
        },
        sanitizeRegister(register) {
            let reg = {
                registerModel: this.arch[register.model],
                x: this.pix(register.x),
                y: this.pix(register.y),
                width: this.pix(register.w),
                height: this.pix(register.h),
                type: register.type,
            }

            if (reg.type === 'InstructionRegister') {
                reg.sequencerModel = this.arch.sequencer
            }

            return reg
        },
        sanitizeBus(bus, x = 0, y = 0) {
            let b = {
                model: this.arch[bus.model],
                x: this.pix(bus.x + x),
                y: this.pix(bus.y + y),
                next: [],
                color: bus.color,
                power:
                    bus.sig === ''
                        ? false
                        : this.$store.state.signals[Signals[bus.sig]],
            }

            for (const subBus of bus.next) {
                subBus.model = bus.model
                subBus.color = bus.color
                b.next.push(this.sanitizeBus(subBus, bus.x + x, bus.y + y))
            }

            return b
        },
    },
}
</script>
