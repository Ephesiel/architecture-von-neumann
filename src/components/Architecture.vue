<template>
    <Bus v-for="(bus, index) of buses" :key="index" v-bind="bus" />
    <ALU v-bind="alu" />
    <DatasManager v-bind="datasManager" />

    <component
        v-for="(register, index) of registers"
        :key="index"
        :is="register.type"
        v-bind="register"
    ></component>
</template>

<script>
import Register from '@/components/Register.vue'
import InstructionRegister from '@/components/InstructionRegister.vue'
import Bus from '@/components/Bus.vue'
import ALU from '@/components/ArithmeticLogicUnit.vue'
import DatasManager from '@/components/DatasManager.vue'
import { Signals } from '@/globals'
import ArchitectureModel from '@/models/von-neumann-architecture-model'
import architectureData from '@/view-datas/architecture.json'
import { getJsonValues } from '@/functions'

export default {
    name: 'Architecture',
    components: {
        Register,
        InstructionRegister,
        Bus,
        ALU,
        DatasManager,
    },
    props: {
        architectureModel: ArchitectureModel,
    },
    computed: {
        registers() {
            const registers = getJsonValues(architectureData, 'registers')

            return registers.map((register) => {
                let reg = {
                    registerModel: this.architectureModel[register.model],
                    datas: register,
                    type: register.type,
                }

                return reg
            })
        },
        buses() {
            return getJsonValues(architectureData, 'buses').map((bus) => {
                return {
                    model1:
                        bus.model !== ''
                            ? this.architectureModel[bus.model]
                            : null,
                    model2:
                        bus.model2 !== ''
                            ? this.architectureModel[bus.model2]
                            : null,
                    hasPower: this.busHasPower,
                    datas: bus,
                }
            })
        },
        alu() {
            return {
                datas: getJsonValues(architectureData, 'alu')[0],
                aluModel: this.architectureModel.ALU,
            }
        },
        datasManager() {
            return {
                datas: getJsonValues(architectureData, 'datasManager')[0],
            }
        },
    },
    methods: {
        busHasPower(bus) {
            let result = 0
            const powerBus = this.$store.state.engine.powerBus
            const signals = this.$store.state.engine.signals
            // Est-ce que le bus a du courant ? Il se peut que le bus n'est pas
            // de modèle (c'est le cas pour sM et eM), dans ce cas, on
            // considère que le courant passe toujours
            const model1Power =
                bus.model1 === null || powerBus.includes(bus.model1)
            // Dans le cas d'un bus bidirectionnel, est-ce que le deuxième bus
            // possède du courant
            const model2Power = powerBus.includes(bus.model2)
            // Si le bus possède un signal, alors le courant est en fonction du
            // signal
            const hasSignal = bus.signals.length > 0
            let signalSend = false
            for (const signal of bus.signals) {
                signalSend = signals[Signals[signal.name]]
                if (signalSend) {
                    break
                }
            }
            if ((!hasSignal || signalSend) && (model1Power || model2Power)) {
                result += 1
                result += model2Power ? 2 : 0
            }
            return result
        },
    },
}
</script>
