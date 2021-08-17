<template>
    <svg
        version="1.1"
        baseProfile="full"
        width="300"
        height="300"
        xmlns="http://www.w3.org/2000/svg"
    >
        Désolé, votre navigateur ne supporte pas le SVG.
    </svg>
    <div>
        <button @click="stepByStep()">Pas à pas</button><br />
        <button @click="phaseByPhase()">Phase par phase</button>
    </div>
</template>

<script>
import Architecture from '@/models/von-neumann-architecture-model'
import Clock from '@/models/clock'

export default {
    name: 'Architecture',
    components: {},
    data() {
        return {
            arch: new Architecture(),
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
