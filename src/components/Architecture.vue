<template>
    <MouseMovingComponent
        :width="realWidth"
        :height="realHeight"
        :componentWidth="realWidth"
        :componentHeight="realHeight"
        :scale="scaleRatio"
        @wheel="changeScale"
        style="border: 1px solid black"
    >
        <svg
            version="1.1"
            baseProfile="full"
            :viewBox="`0 0 ${width} ${height}`"
            width="100%"
            height="100%"
            :stroke-width="strokeWidth"
            :font-size="fontSize"
            :fill="fontColor"
            xmlns="http://www.w3.org/2000/svg"
            style="overflow: visible"
        >
            <Bus v-for="(bus, index) of buses" :key="index" :datas="bus" />
            <ALU v-bind="alu" />
            <DatasManager v-bind="datasManager" />

            <component
                v-for="(register, index) of registers"
                :key="index"
                :is="register.type"
                v-bind="register"
            ></component>

            Désolé, votre navigateur ne supporte pas le SVG.
        </svg>
    </MouseMovingComponent>

    <button @click="stepByStep()">Pas à pas</button><br />
    <button @click="phaseByPhase()">Phase par phase</button><br />
    <label>Scale de l'architecture</label>
    <input type="range" min="50" max="200" v-model="scale" />

    <!--
        Séquenceur et mémoire ? Ou juste séquenceur, et la mémoire dans un autre SVG ?
        Dans les deux cas, ajouter un bouton pour choisir d'afficher ou non l'élément.

    <MouseMovingComponent
        :width="realWidth"
        :height="realHeight"
        :componentWidth="realWidth"
        :componentHeight="realHeight"
        :scale="scaleRatio"
        @wheel="changeScale"
        style="border: 1px solid black"
    >
        <svg
            version="1.1"
            baseProfile="full"
            :viewBox="`0 0 ${width} ${height}`"
            width="100%"
            height="100%"
            :stroke-width="strokeWidth"
            :font-size="fontSize"
            :fill="fontColor"
            xmlns="http://www.w3.org/2000/svg"
            style="overflow: visible"
        >
            
            <Sequencer 
                />

            Désolé, votre navigateur ne supporte pas le SVG.
        </svg>
    </MouseMovingComponent>
    -->
</template>

<script>
import Architecture from '@/models/von-neumann-architecture-model'
import Register from '@/components/Register.vue'
import InstructionRegister from '@/components/InstructionRegister.vue'
import MouseMovingComponent from '@/components/MouseMovingComponent.vue'
import Bus from '@/components/Bus.vue'
import ALU from '@/components/ArithmeticLogicUnit.vue'
import DatasManager from '@/components/DatasManager.vue'
import Clock from '@/models/clock'
import architectureData from '@/view-datas/architecture.json'
import architectureStyle from '@/view-datas/architecture-style.json'
import { getJsonValues } from '@/functions'

export default {
    name: 'Architecture',
    components: {
        Register,
        InstructionRegister,
        Bus,
        ALU,
        DatasManager,
        MouseMovingComponent,
    },
    data() {
        return {
            arch: new Architecture(),
            width: architectureStyle.svgWidth,
            height: architectureStyle.svgHeight,
            fontSize: architectureStyle.fontSize,
            fontColor: architectureStyle.fontColor,
            strokeWidth: architectureStyle.elementStrokeWidth,
            scale: 100,
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
            const registers = getJsonValues(architectureData, 'registers')

            return registers.map((register) => {
                let reg = {
                    registerModel: this.arch[register.model],
                    datas: register,
                    type: register.type,
                }

                if (register.type === 'InstructionRegister') {
                    reg.sequencerModel = this.arch.sequencer
                }

                return reg
            })
        },
        buses() {
            return getJsonValues(architectureData, 'buses')
        },
        alu() {
            return {
                datas: getJsonValues(architectureData, 'alu')[0],
                aluModel: this.arch.ALU,
            }
        },
        datasManager() {
            return {
                datas: getJsonValues(architectureData, 'datasManager')[0],
            }
        },
        scaleRatio() {
            return this.scale / 100
        },
        realWidth() {
            return this.$store.state.page.width
        },
        realHeight() {
            return this.realWidth * (this.height / this.width)
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
        changeScale(event) {
            this.scale -= event.deltaY * 0.1
            this.scale = Math.max(50, Math.min(this.scale, 200))
        },
    },
}
</script>
