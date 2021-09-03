<template>
    <MouseMovingComponent
        :width="realWidth"
        :height="realHeight"
        :componentWidth="realWidth"
        :componentHeight="realHeight"
        :scale="scaleRatio"
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
            <Sequencer :sequencer-model="arch.sequencer" />
            Désolé, votre navigateur ne supporte pas le SVG.
        </svg>
    </MouseMovingComponent>
    <div>
        <button @click="stepByStep()">Pas à pas</button><br />
        <button @click="phaseByPhase()">Phase par phase</button>
    </div>
</template>

<script>
import Sequencer from '@/components/Sequencer.vue'
import Architecture from '@/models/von-neumann-architecture-model'
import Clock from '@/models/clock'
import architectureStyle from '@/view-datas/architecture-style.json'
import MouseMovingComponent from '@/components/MouseMovingComponent.vue'

export default {
    name: 'Architecture',
    components: {
        Sequencer,
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
    },
}
</script>

<style scoped lang="scss"></style>
