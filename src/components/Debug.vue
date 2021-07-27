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
        <InstructionRegister
            :register-model="arch.RI"
            :width="componentWidth"
            :height="componentHeight"
            :sequencer-model="arch.sequencer"
            :x="x(1)"
            :y="y(1)"
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
        }
    },
    computed: {
        width() {
            return this.$store.state.svgWidth / 2
        },
        height() {
            return this.$store.state.svgHeight - 400
        },
        componentWidth() {
            // 5 composants sur une ligne + marge d'un composant à gauche et à droite
            const tot = this.width / 6
            return tot - 0.1 * tot
        },
        componentHeight() {
            // Au maximum, l'architecture doit faire 2/3 de la page ?, et 4 composants par colonne
            const tot = this.height / 8
            return tot - 0.1 * tot
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
