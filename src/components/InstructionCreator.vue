<template>
    <form class="form">
        <table>
            <tr>
                <td class="label">
                    <label for="cop">Code Opération : </label>
                </td>
                <td>
                    <select id="cop" v-model="COP">
                        <option
                            v-for="(cop, index) of codeOperations"
                            :value="cop"
                            :key="index"
                        >
                            {{ cop }}
                        </option>
                    </select>
                </td>
            </tr>
            <tr v-if="COP !== null">
                <td class="label">
                    <label for="ma">Mode d'Adressage : </label>
                </td>
                <td>
                    <div v-if="noMA">Pas de mode d'adressage</div>
                    <select v-else id="ma" v-model="MA">
                        <option
                            v-for="(ma, index) of addressModes"
                            :value="ma"
                            :key="index"
                        >
                            {{ ma }}
                        </option>
                    </select>
                </td>
            </tr>
            <tr v-if="COPMA !== null">
                <td class="label">
                    <label for="ra">Référence Adresse : </label>
                </td>
                <td>
                    <input
                        type="number"
                        :min="minRA"
                        :max="maxRA"
                        id="ra"
                        v-model="RA"
                    />
                </td>
            </tr>
            <tr>
                <td colspan="2"><hr /></td>
            </tr>
            <tr>
                <td class="label">
                    <label for="address">Écrire à l'adresse : </label>
                </td>
                <td>
                    <input
                        type="number"
                        min="0"
                        :max="maxAddr"
                        id="address"
                        v-model="address"
                    />
                </td>
            </tr>
        </table>

        <div v-if="COPMA !== null">
            <button type="button" @click="write">Envoyer</button>
        </div>
    </form>
</template>

<script>
import instructions from '@/instructions.json'
import MemoryModel from '@/models/memory/memory-model'
import CMParser from '@/central-memory-parser'
import { MIN_RA, MAX_RA, MAX_ADDR } from '@/globals'

export default {
    props: {
        memoryModel: MemoryModel,
    },
    data() {
        return {
            COP: null,
            MA: null,
            RA: 0,
            address: 0,
            minRA: MIN_RA,
            maxRA: MAX_RA,
            maxAddr: MAX_ADDR,
        }
    },
    computed: {
        codeOperations() {
            let codes = []
            for (const instruction of Object.values(instructions)) {
                if (!codes.includes(instruction.COP)) {
                    codes.push(instruction.COP)
                }
            }
            return codes
        },
        addressModes() {
            let modes = []
            for (const instruction of Object.values(instructions)) {
                if (instruction.COP === this.COP && instruction.MA !== '') {
                    modes.push(instruction.MA)
                }
            }
            return modes
        },
        noMA() {
            return this.addressModes.length === 0
        },
        COPMA() {
            for (const [key, instruction] of Object.entries(instructions)) {
                if (
                    instruction.COP === this.COP &&
                    (instruction.MA === '' || instruction.MA === this.MA)
                ) {
                    return key
                }
            }
            return null
        },
    },
    methods: {
        write() {
            const addr = CMParser.parseAddress(parseInt(this.address))
            const value = CMParser.parse(
                parseInt(this.COPMA),
                parseInt(this.RA)
            )

            this.memoryModel.setValue(addr, value)
        },
    },
}
</script>

<style lang="scss" scoped>
.form {
    border: 1px solid black;
    padding: 10px;

    input,
    select {
        width: 100%;
        min-width: 180px;
    }
}
table {
    width: 100%;
    td {
        padding: 10px 2px;
    }

    tr td:first-child {
        text-align: right;
        min-width: 160px;
    }

    tr td:last-child {
        text-align: left;
    }
}
.flex {
    display: flex;
    flex-direction: column;
}
.label {
    font-weight: bold;
}
</style>
