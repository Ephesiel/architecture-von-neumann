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
import sequencerStyle from '@/view-datas/sequencer-style.json'
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
            width: sequencerStyle.svgWidth,
            height: sequencerStyle.svgHeight,
            fontSize: sequencerStyle.fontSize,
            fontColor: sequencerStyle.fontColor,
            strokeWidth: sequencerStyle.elementStrokeWidth,
            scale: 100,
        }
    },
    created() {
        const buses = this.arch.buses().concat(this.arch.sequencer.buses())

        Clock.register((UTA, signals) => {
            for (const signal of Object.keys(signals)) {
                if (signals[signal] > 0) {
                    this.$store.commit('addSignal', signal)
                }
            }
            for (const bus of buses) {
                if (bus.hasPower()) {
                    if (!this.$store.state.engine.powerBus.includes(bus)) {
                        this.$store.commit('setPowerToBus', bus)
                    }
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
            this.$store.commit('resetBusPower')
            this.arch.stepByStep()
        },
        phaseByPhase() {
            this.$store.commit('resetSignals')
            this.$store.commit('resetBusPower')
            this.arch.phaseByPhase()
        },
    },
}
</script>

<style scoped lang="scss"></style>
