<template>
    <!--
    <button @click="arch.stepByStep()">Pas à pas</button><br />
    <button @click="arch.phaseByPhase()">Phase par phase</button>-->
    <svg
        version="1.1"
        baseProfile="full"
        :width="width"
        :height="height"
        xmlns="http://www.w3.org/2000/svg"
    >
        <!-- L1 RA, RB, RC -->
        <Register v-bind="RA" />
        <Register v-bind="RB" />
        <Register v-bind="RC" />

        <Register v-bind="CO" />
        <Register v-bind="RX" />
        <Register v-bind="SP" />
        <InstructionRegister v-bind="RI" />

        <!-- L3 RAM Mémoire RE -->
        <Register v-bind="RAM" />
        <Register v-bind="RE" />

        <Bus v-bind="B1" />
        <Bus v-bind="B2" />
        Désolé, votre navigateur ne supporte pas le SVG.
    </svg>
    <button @click="arch.stepByStep()">Pas à pas</button><br />
    <button @click="arch.phaseByPhase()">Phase par phase</button>
</template>

<script>
import Architecture from '@/models/von-neumann-architecture-model'
import Register from '@/components/Register.vue'
import InstructionRegister from '@/components/InstructionRegister.vue'
import Bus from '@/components/Bus.vue'
import Signals from '@/signals'

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
        }
    },
    computed: {
        RA() {
            return {
                width: this.componentWidth,
                height: this.componentHeight,
                registerModel: this.arch.RA,
                x: this.x(0.5),
                y: this.y(0),
            }
        },
        RB() {
            return {
                width: this.componentWidth,
                height: this.componentHeight,
                registerModel: this.arch.RB,
                x: this.x(1.5),
                y: this.y(0),
            }
        },
        RC() {
            return {
                width: this.componentWidth,
                height: this.componentHeight,
                registerModel: this.arch.RC,
                x: this.x(2.5),
                y: this.y(0),
            }
        },
        CO() {
            return {
                width: this.componentWidth,
                height: this.componentHeight,
                registerModel: this.arch.CO,
                x: this.x(0),
                y: this.y(1),
            }
        },
        RX() {
            return {
                width: this.componentWidth,
                height: this.componentHeight,
                registerModel: this.arch.RX,
                x: this.x(1),
                y: this.y(1),
            }
        },
        SP() {
            return {
                width: this.componentWidth,
                height: this.componentHeight,
                registerModel: this.arch.SP,
                x: this.x(2),
                y: this.y(1),
            }
        },
        RI() {
            return {
                width: this.componentWidth,
                height: this.componentHeight,
                registerModel: this.arch.RI,
                sequencerModel: this.arch.sequencer,
                x: this.x(3),
                y: this.y(1),
            }
        },
        RAM() {
            return {
                width: this.componentWidth,
                height: this.componentHeight,
                registerModel: this.arch.RAM,
                x: this.x(0.5),
                y: this.y(2),
            }
        },
        RE() {
            return {
                width: this.componentWidth,
                height: this.componentHeight,
                registerModel: this.arch.RE,
                x: this.x(2.5),
                y: this.y(2),
            }
        },
        B1() {
            return {
                model: this.arch.bus1,
                points: this.calculBusPath(
                    this.x(-0.2),
                    this.y(-0.55),
                    this.x(5),
                    this.x(0)
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
                    this.x(0) + this.x(-0.38)
                ),
                color: 'red',
            }
        },
        width() {
            return this.$store.state.svgWidth
        },
        height() {
            return this.$store.state.svgHeight
        },
        componentWidth() {
            // 3 composants sur une ligne + marge d'un composant à gauche et à droite
            const tot = this.width / 4
            return tot - 0.1 * tot
        },
        componentHeight() {
            // Jusqu'à 16 composants l'un en dessous de l'autre par colonne
            const tot = this.height / 17
            return tot - 0.1 * tot
        },
    },
    methods: {
        x(n) {
            // Marges horizontales
            return (
                this.componentWidth / 2 +
                n * this.componentWidth +
                n * 0.1 * (this.width / 4)
            )
        },
        y(n) {
            // Marges verticales
            return (
                this.componentHeight / 2 +
                n * this.componentHeight +
                n * 0.1 * (this.height / 2)
            )
        },
        calculBusPath(distX, distY, rightCornerX, leftCornerX) {
            console.log(distX, distY)
            // Les points de sortie des registres L2 et L3
            const RE = {
                x: this.RE.x + this.RE.width / 2 + distX,
                y: this.RE.y,
                sig: Signals.REB1,
            }
            const CO = {
                x: this.CO.x + this.CO.width / 2 + distX,
                y: this.CO.y,
                sig: Signals.COB1,
            }
            const RX = {
                x: this.RX.x + this.RX.width / 2 + distX,
                y: this.RX.y,
                sig: Signals.RXB1,
            }
            const SP = {
                x: this.SP.x + this.SP.width / 2 + distX,
                y: this.SP.y,
                sig: Signals.SPB1,
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
                y: SP.y + distY,
                connections: [SP, RX1],
            }

            // Les points "angles" à droite
            const rightBottomCorner = {
                x: rightCornerX,
                y: RE1.y,
                connections: [RE1],
            }
            const rightMiddleCorner = {
                x: rightCornerX,
                y: SP1.y,
                connections: [rightBottomCorner, SP1],
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
                sig: Signals.RAB1,
            }
            const RB = {
                x: this.RB.x + this.RB.width / 2 + distX,
                y: this.RB.y,
                sig: Signals.RBB1,
            }
            const RC = {
                x: this.RC.x + this.RC.width / 2 + distX,
                y: this.RC.y,
                sig: Signals.RCB1,
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
                x: leftCornerX,
                y: RA1.y,
                connections: [RA1],
            }

            return leftTopCorner
        },
    },
}
</script>
