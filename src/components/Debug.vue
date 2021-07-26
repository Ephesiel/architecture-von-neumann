<template>
    <!--<svg :width="width" :height="height">
        <Sequencer :sequencer-model="arch.sequencer"></Sequencer>
    </svg>
    <button @click="arch.stepByStep()">Pas à pas</button><br />
    <button @click="arch.phaseByPhase()">Phase par phase</button>-->
    <svg
        version="1.1"
        baseProfile="full"
        :width="width"
        :height="height"
        xmlns="http://www.w3.org/2000/svg"
    >
        <Sequencer :sequencer-model="arch.sequencer"></Sequencer>
        Désolé, votre navigateur ne supporte pas le SVG.
    </svg>
</template>

<script>
import Architecture from '@/models/von-neumann-architecture-model'
import Sequencer from '@/components/Sequencer.vue'

export default {
    name: 'Debug',
    components: {
        Sequencer,
    },
    data() {
        return {
            arch: new Architecture(),
        }
    },
    computed: {
        width() {
            return this.$store.state.svgWidth
        },
        height() {
            return this.$store.state.svgHeight
        },
    },
}
</script>

<style scoped lang="scss"></style>
