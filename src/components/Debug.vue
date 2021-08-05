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
        <InstructionRegister
            :register-model="arch.RI"
            :width="componentWidth"
            :height="componentHeight"
            :sequencer-model="arch.sequencer"
            :x="750"
            :y="50"
            :font-size="14"
        />
        Désolé, votre navigateur ne supporte pas le SVG.
    </svg>
    <button @click="arch.stepByStep()">Pas à pas</button><br />
    <button @click="arch.phaseByPhase()">Phase par phase</button>
</template>

<script>
import Architecture from '@/models/von-neumann-architecture-model'
import InstructionRegister from '@/components/InstructionRegister.vue'

export default {
    name: 'Architecture',
    components: {
        InstructionRegister,
    },
    data() {
        return {
            arch: new Architecture(),
            width: 200,
            height: 150,
        }
    },
    computed: {
        componentWidth() {
            return 400
        },
        componentHeight() {
            return 50
        },
        realWidth() {
            return this.$store.state.pageWidth
        },
        realHeight() {
            return this.realWidth * (this.height / this.width)
        },
    },
    methods: {
        x(n) {
            // Marges horizontales
            return (
                this.componentWidth / 2 +
                n * this.componentWidth +
                n * 0.1 * (this.width / 6)
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
    },
}
</script>

<style scoped lang="scss"></style>
