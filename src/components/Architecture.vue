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
        <!--<InstructionRegister v-bind="RI" />-->

        <component
            v-for="(register, index) of registers"
            :key="index"
            :is="register.type"
            v-bind="register"
        ></component>

        <!-- <Bus v-bind="B1" /> -->
        <!-- <Bus v-bind="B2" /> -->
        Désolé, votre navigateur ne supporte pas le SVG.
    </svg>
    <button @click="stepByStep()">Pas à pas</button><br />
    <button @click="phaseByPhase()">Phase par phase</button>
</template>

<script>
import Architecture from '@/models/von-neumann-architecture-model'
import Register from '@/components/Register.vue'
import InstructionRegister from '@/components/InstructionRegister.vue'
//import Bus from '@/components/Bus.vue'
//import Signals from '@/signals'
import Clock from '@/models/clock'
import architectureData from '@/view-datas/architecture.json'
import Helper from '@/helper'

export default {
    name: 'Architecture',
    components: {
        Register,
        InstructionRegister,
        //Bus,
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

            let datas = []

            for (let register of registers) {
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

                datas.push(reg)
            }

            return datas
        },
        /*OC() {
            return {
                x: this.x(0),
                y: this.y(1),
            }
        },
        B1() {
            return {
                model: this.arch.bus1,
                points: this.calculBusPath(
                    this.x(-0.2),
                    this.y(-0.55),
                    this.x(5),
                    this.x(0),
                    {
                        RE: Signals.REB1,
                        CO: Signals.COB1,
                        RX: Signals.RXB1,
                        SP: Signals.SPB1,
                        RI: Signals.RIB1,
                        RA: Signals.RAB1,
                        RB: Signals.RBB1,
                        RC: Signals.RCB1,
                    }
                ),
                color: 'green',
            }
        },
        B2() {
            return {
                model: this.arch.bus2,
                points: this.calculBusPath(
                    -this.x(-0.2),
                    this.y(-0.45),
                    this.x(5) + this.x(-0.38),
                    this.x(0) + this.x(-0.38),
                    {
                        RE: Signals.REB2,
                        CO: Signals.COB2,
                        RX: Signals.RXB2,
                        SP: Signals.SPB2,
                        RI: Signals.RIB2,
                        RA: Signals.RAB2,
                        RB: Signals.RBB2,
                        RC: Signals.RCB2,
                    }
                ),
                color: 'red',
            }
        },*/
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
        /*calculBusPath(distX, distY, rightCornerX, signals) {
            // Les points de sortie des registres L2 et L3
            const RE = {
                x: this.RE.x + this.RE.width / 2 + distX,
                y: this.RE.y,
                sig: signals.RE,
            }
            const CO = {
                x: this.CO.x + this.CO.width / 2 + distX,
                y: this.CO.y,
                sig: signals.CO,
            }
            const RX = {
                x: this.RX.x + this.RX.width / 2 + distX,
                y: this.RX.y,
                sig: signals.RX,
            }
            const SP = {
                x: this.SP.x + this.SP.width / 2 + distX,
                y: this.SP.y,
                sig: signals.SP,
            }
            const RI = {
                x: this.RI.x + this.RI.width / 2 + distX,
                y: this.RI.y,
                sig: signals.RI,
            }

            // Les points un peu au dessus des registres L2 et L3
            const RE1 = {
                x: RE.x,
                y: RE.y + distY,
                connections: [RE],
            }
            const CO1 = {
                x: CO.x,
                y: CO.y + distY,
                connections: [CO],
            }
            const RX1 = {
                x: RX.x,
                y: RX.y + distY,
                connections: [RX, CO1],
            }
            const SP1 = {
                x: SP.x,
            console.log(size)

            // Les points "angles" à droite
            const rightBottomCorner = {
                x: rightCornerX,
                y: RE1.y,
                connections: [RE1],
            }
            const rightMiddleCorner = {
                x: rightCornerX,
                y: SP1.y,
                connections: [rightBottomCorner, RI1],
            }
            const rightTopCorner = {
                x: rightCornerX,
                y: this.RA.y + distY,
                connections: [rightMiddleCorner],
            }

            // Les points de sortie des registres L1
            const RA = {
                x: this.RA.x + this.RA.width / 2 + distX,
                y: this.RA.y,
                sig: signals.RA,
            }
            const RB = {
                x: this.RB.x + this.RB.width / 2 + distX,
                y: this.RB.y,
                sig: signals.RB,
            }
            const RC = {
                x: this.RC.x + this.RC.width / 2 + distX,
                y: this.RC.y,
                sig: signals.RC,
            }

            // Les points un peu au dessus des registres L1
            const RC1 = {
                x: RC.x,
                y: RC.y + distY,
                connections: [RC, rightTopCorner],
            }
            const RB1 = {
                x: RB.x,
                y: RB.y + distY,
                connections: [RB, RC1],
            }
            const RA1 = {
                x: RA.x,
                y: RA.y + distY,
                connections: [RA, RB1],
            }

            // Les points "angles" à gauche
            const leftTopCorner = {
                x: this.OC.x + distX / 2,
                y: RA1.y,
                connections: [RA1],
            }
            const OC = {
                x: this.OC.x + distX / 2,
                y: this.OC.y,
                connections: [leftTopCorner],
            }

            return OC
        },*/
        stepByStep() {
            this.$store.commit('resetSignals')
            this.arch.stepByStep()
        },
        phaseByPhase() {
            this.$store.commit('resetSignals')
            this.arch.phaseByPhase()
        },
    },
}
</script>
