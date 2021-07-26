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
        <Register
            :register-model="arch.RA"
            :width="componentWidth"
            :height="componentHeight"
            :x="x(0.5)"
            :y="y(0)"
        />
        <Register
            :register-model="arch.RB"
            :width="componentWidth"
            :height="componentHeight"
            :x="x(1.5)"
            :y="y(0)"
        />
        <Register
            :register-model="arch.RC"
            :width="componentWidth"
            :height="componentHeight"
            :x="x(2.5)"
            :y="y(0)"
        />

        <!-- L2 CO RX SP RI -->
        <Register
            :register-model="arch.CO"
            :width="componentWidth"
            :height="componentHeight"
            :x="x(1)"
            :y="y(1)"
        />
        <Register
            :register-model="arch.RX"
            :width="componentWidth"
            :height="componentHeight"
            :x="x(2)"
            :y="y(1)"
        />
        <Register
            :register-model="arch.SP"
            :width="componentWidth"
            :height="componentHeight"
            :x="x(3)"
            :y="y(1)"
        />
        <InstructionRegister
            :register-model="arch.RI"
            :width="componentWidth"
            :height="componentHeight"
            :x="x(4)"
            :y="y(1)"
        />

        <!-- L3 RAM Mémoire RE -->
        <Register
            :register-model="arch.RAM"
            :width="componentWidth"
            :height="componentHeight"
            :x="x(0.5)"
            :y="y(2)"
        />
        <Register
            :register-model="arch.RE"
            :width="componentWidth"
            :height="componentHeight"
            :x="x(2.5)"
            :y="y(2)"
        />
        Désolé, votre navigateur ne supporte pas le SVG.
    </svg>
</template>

<script>
import Architecture from '@/models/von-neumann-architecture-model'
import Register from '@/components/Register.vue'
import InstructionRegister from '@/components/InstructionRegister.vue'

export default {
    name: 'Debug',
    components: {
        Register,
        InstructionRegister,
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
