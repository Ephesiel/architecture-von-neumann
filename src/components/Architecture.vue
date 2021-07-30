<template>
    <!--
    <button @click="arch.stepByStep()">Pas à pas</button><br />
    <button @click="arch.phaseByPhase()">Phase par phase</button>-->
    <svg
        version="1.1"
        baseProfile="full"
        :viewBox="`0 0 ${width} ${height}`"
        :width="realWidth"
        :height="realHeight"
        :stroke-width="strokeWidth"
        xmlns="http://www.w3.org/2000/svg"
    >
        <Bus v-for="(bus, index) of buses" :key="index" v-bind="bus" />

        <component
            v-for="(register, index) of registers"
            :key="index"
            :is="register.type"
            v-bind="register"
        ></component>

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
            return this.$store.state.pageWidth
        },
        realHeight() {
            return this.realWidth * (this.height / this.width)
        },
        strokeWidth() {
            return this.width / 1000
        },
    },
    methods: {
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
                x: register.x,
                y: register.y,
                width: register.w,
                height: register.h,
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
                x: bus.x + x,
                y: bus.y + y,
                next: [],
                bridges: [],
                color: bus.color,
                powerFromSignal: bus.powerFromSig,
                signal: bus.sig,
            }

            for (const bridge of bus.bridges) {
                b.bridges.push({ dist: bridge.dist, size: bridge.size })
            }

            b.bridges.sort((b1, b2) => {
                return b1.dist > b2.dist ? 1 : b1.dist < b2.dist ? -1 : 0
            })

            for (const subBus of bus.next) {
                subBus.model = bus.model
                subBus.color = bus.color
                subBus.powerFromSig = bus.powerFromSig
                b.next.push(this.sanitizeBus(subBus, bus.x + x, bus.y + y))
            }

            return b
        },
    },
}
</script>
