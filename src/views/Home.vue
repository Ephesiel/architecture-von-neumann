<template>
    <div class="home">
        <div class="buttons-bar">
            <button class="btn" @click="stepByStep()">Pas à pas</button>
            <button class="btn" @click="phaseByPhase()">Phase par phase</button>
            <button class="btn" @click="reset()">Reset</button>
            <button class="btn" @click="toggleArch()">
                {{
                    displayArch
                        ? 'Cacher architecture'
                        : 'Afficher architecture'
                }}
            </button>
            <button class="btn" @click="toggleSequencer()">
                {{
                    displaySequencer
                        ? 'Cacher séquenceur'
                        : 'Afficher séquenceur'
                }}
            </button>
            <button class="btn" @click="toggleMemory()">
                {{ displayMemory ? 'Cacher mémoire' : 'Afficher mémoire' }}
            </button>
        </div>
        <div class="flex">
            <div class="svg">
                <ArchitectureSVG
                    v-if="displayArch"
                    class="architecture-svg"
                    :architecture-model="arch"
                />
                <SequencerSVG
                    v-if="displaySequencer"
                    class="sequencer-svg"
                    :sequencer-model="arch.sequencer"
                />
            </div>
            <div v-if="displayMemory">
                <MemorySVG class="memory-svg" :memory-model="arch.memory" />
                <InstructionCreator :memoryModel="arch.memory" />
            </div>
        </div>
    </div>
</template>

<script>
import ArchitectureModel from '@/models/von-neumann-architecture-model'
import Clock from '@/models/clock'
import ArchitectureSVG from '@/components/svg/ArchitectureSVG.vue'
import SequencerSVG from '@/components/svg/SequencerSVG.vue'
import MemorySVG from '@/components/svg/MemorySVG.vue'
import InstructionCreator from '@/components/InstructionCreator.vue'

export default {
    name: 'Home',
    components: {
        ArchitectureSVG,
        SequencerSVG,
        MemorySVG,
        InstructionCreator,
    },
    data() {
        return {
            arch: new ArchitectureModel(),
            displayArch: true,
            displaySequencer: true,
            displayMemory: true,
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

        // On lance un premier tick pour que les méthodes updates soient toutes
        // appelées au moins un fois
        Clock.waitAndTick(1, 1)
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
        reset() {
            this.$store.commit('resetSignals')
            this.$store.commit('resetBusPower')
            this.arch.reset()
        },
        toggleArch() {
            this.displayArch = !this.displayArch
            console.log('-----------------------')
            console.log(
                'Architecture ' + (this.displayArch ? 'affichée' : 'cachée')
            )
            console.log('-----------------------')
        },
        toggleSequencer() {
            this.displaySequencer = !this.displaySequencer
            console.log('-----------------------')
            console.log(
                'Séquenceur ' + (this.displaySequencer ? 'affiché' : 'caché')
            )
            console.log('-----------------------')
        },
        toggleMemory() {
            this.displayMemory = !this.displayMemory
            console.log('-----------------------')
            console.log(
                'mémoire ' + (this.displayMemory ? 'affichée' : 'cachée')
            )
            console.log('-----------------------')
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
.instructions-creator {
    width: 400px;
}
.flex {
    display: flex;
    justify-content: space-evenly;
}
</style>
