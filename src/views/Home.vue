<template>
    <div class="home">
        <div class="buttons-bar">
            <button class="btn" @click="stepByStep()">Pas à pas</button>
            <button class="btn" @click="phaseByPhase()">Phase par phase</button>
        </div>
        <div class="svg">
            <ArchitectureSVG
                class="architecture-svg"
                :architecture-model="arch"
            />
            <SequencerSVG
                class="sequencer-svg"
                :sequencer-model="arch.sequencer"
            />
        </div>
    </div>
</template>

<script>
import ArchitectureModel from '@/models/von-neumann-architecture-model'
import Clock from '@/models/clock'
import ArchitectureSVG from '@/components/svg/ArchitectureSVG.vue'
import SequencerSVG from '@/components/svg/SequencerSVG.vue'

export default {
    name: 'Home',
    components: {
        ArchitectureSVG,
        SequencerSVG,
    },
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

<style lang="scss" scoped>
.buttons-bar {
    margin: 5px;
    .btn {
        margin-right: 5px;
    }
}
.btn {
    padding: 5px;
    border-radius: 3px;
    border: 1px solid black;
    background: #80aaff;

    &:hover {
        background: #ccddff;
        cursor: pointer;
    }
}
.svg div {
    margin: 0 auto;
}
.svg .architecture-svg {
    margin-bottom: 20px;
}
</style>
