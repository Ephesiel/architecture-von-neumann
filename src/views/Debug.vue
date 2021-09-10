<template>
    <div class="home">
        <div class="buttons-bar">
            <button class="btn" @click="stepByStep()">Pas à pas</button>
            <button class="btn" @click="phaseByPhase()">Phase par phase</button>
        </div>
    </div>
</template>

<script>
import ArchitectureModel from '@/models/von-neumann-architecture-model'
import Clock from '@/models/clock'

export default {
    name: 'Debug',
    data() {
        return {
            arch: new ArchitectureModel(),
        }
    },
    created() {
        // On enregistre les changements intéressants de l'architecture
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
