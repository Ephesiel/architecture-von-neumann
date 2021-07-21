<template>
    <div><h1>Séquenceur</h1></div>
    <div>
        <h2>Mémoire microprogrammée</h2>
        <table>
            <tr>
                <th>Adresse</th>
                <th>Valeur</th>
            </tr>
            <tr v-for="o in memoryData" :key="o.key">
                <td>{{ o.key }}</td>
                <td>{{ o.val }}</td>
            </tr>
        </table>
    </div>
    <div>
        <h2>Multiplexeurs</h2>
        <h3>Multiplexeur de condition</h3>
        <table>
            <tr>
                <th>Bus</th>
                <th>Valeur</th>
            </tr>
            <tr v-for="o in conditionMultData" :key="o.key">
                <td>{{ o.key }}</td>
                <td>{{ o.val }}</td>
            </tr>
        </table>
        <h3>Multiplexeur principal</h3>
        <table>
            <tr>
                <th>Bus</th>
                <th>Valeur</th>
            </tr>
            <tr v-for="o in nextAddrMultData" :key="o.key">
                <td>{{ o.key }}</td>
                <td>{{ o.val }}</td>
            </tr>
        </table>
        <h3>Multiplexeur de phases</h3>
        <table>
            <tr>
                <th>Bus</th>
                <th>Valeur</th>
            </tr>
            <tr v-for="o in phaseMultData" :key="o.key">
                <td>{{ o.key }}</td>
                <td>{{ o.val }}</td>
            </tr>
        </table>
    </div>
    <div>
        <h2>Registres</h2>
        <div>Phase : {{ phase }}</div>
        <div>REMM : {{ remm }}</div>
        <div>RAMM : {{ ramm }}</div>
        <div>COPMA : {{ copma }}</div>
        <div>fetch : {{ fetch }}</div>
    </div>
    <div><button @click="clickStep">Pas à pas</button></div>
    <div><button @click="clickPhase">Phase par phase</button></div>
</template>

<script>
import Architecture from '@/models/von-neumann-architecture-model'
import { MPM_BITS_ADDRESSES } from '@/globals'
import { uint } from '@/integer'

export default {
    name: 'Debug',
    data() {
        return {
            arch: new Architecture(),
            phase: 0,
            remm: 0,
            ramm: 0,
            copma: 0,
            fetch: 0,
            memoryData: {},
            conditionMultData: {},
            phaseMultData: {},
            nextAddrMultData: {},
        }
    },
    methods: {
        clickStep() {
            this.arch.stepByStep()
            this.update()
        },
        clickPhase() {
            this.arch.phaseByPhase()
            this.update()
        },
        updatePhase() {
            this.phase =
                this.arch.sequencer.phaseCounter.currentPhase.toNumber()
        },
        updateREMM() {
            this.remm = this.arch.sequencer.REMM.getCurrentValue().toBinary()
        },
        updateRAMM() {
            this.ramm = this.arch.sequencer.RAMM.getCurrentValue().toNumber()
        },
        updateCOPMA() {
            this.copma = this.arch.sequencer.COPMA.getCurrentValue().toBinary()
        },
        updateFetch() {
            this.fetch = this.arch.sequencer.fetch.getCurrentValue().toNumber()
        },
        updateMemoryData() {
            const obj = {}
            for (let i = 0; i < 2 ** MPM_BITS_ADDRESSES; ++i) {
                const tmp = this.arch.sequencer.microprogammedMemory.getValue(
                    uint(i)
                )
                if (tmp.toNumber() !== 0) {
                    obj[i] = {
                        key: i,
                        val: tmp.toBinary(),
                    }
                }
            }
            this.memoryData = obj
        },
        updateConditionMultData() {
            const obj = {}
            for (const k in this.arch.sequencer.conditiontMult.inputs) {
                obj[k] = {
                    key: k,
                    val: this.arch.sequencer.conditiontMult.inputs[k]
                        .getValue()
                        .toNumber(),
                }
            }
            obj['val'] = {
                key: 'val',
                val: this.arch.sequencer.conditiontMult.selectorBus
                    .getValue()
                    .toNumber(),
            }
            this.conditionMultData = obj
        },
        updatePhaseMultData() {
            const obj = {}
            for (const k in this.arch.sequencer.phaseMult.inputs) {
                obj[k] = {
                    key: k,
                    val: this.arch.sequencer.phaseMult.inputs[k].getValue(),
                }
            }
            obj['val'] = {
                key: 'val',
                val: this.arch.sequencer.phaseMult.selectorBus
                    .getValue()
                    .toNumber(),
            }
            this.phaseMultData = obj
        },
        updateNextAddrMultData() {
            const obj = {}
            for (const k in this.arch.sequencer.nextAddrMult.inputs) {
                obj[k] = {
                    key: k,
                    val: this.arch.sequencer.nextAddrMult.inputs[k]
                        .getValue()
                        .toNumber(),
                }
            }
            obj['val'] = {
                key: 'val',
                val: this.arch.sequencer.nextAddrMult.selectorBus
                    .getValue()
                    .toNumber(),
            }
            this.nextAddrMultData = obj
        },
        update() {
            this.updatePhase()
            this.updateREMM()
            this.updateRAMM()
            this.updateCOPMA()
            this.updateFetch()
            this.updateMemoryData()
            this.updateConditionMultData()
            this.updatePhaseMultData()
            this.updateNextAddrMultData()
        },
    },
    created() {
        this.update()
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
table {
    border-collapse: collapse;
    margin: 0 auto 10px auto;

    td,
    th {
        border: 1px solid #ccc;
    }
}
</style>
