<template>
    <g>
        <!--<Register
            :register-model="sequencerModel.REMM"
            :width="200"
            :height="100"
            :x="50"
            :y="50"
        />-->
        <Multiplexer
            :multiplexer-model="sequencerModel.nextAddrMult"
            :x="10"
            :y="20"
        />
        <Multiplexer
            :multiplexer-model="sequencerModel.phaseMult"
            :x="10"
            :y="20"
        />
        <Memory
            :memory-model="sequencerModel.microprogammedMemory"
            :width="100"
            :height="30"
            :x="50"
            :y="4"
            :dataProcessor="translate"
        />
    </g>
</template>

<script>
import SequencerModel from '@/models/sequencer'
import MMParser from '@/microprogrammed-memory-parser'
//import Register from '@/components/Register.vue'
import Multiplexer from '@/components/Multiplexer.vue'
import Memory from '@/components/Memory.vue'

export default {
    name: 'Sequencer',
    props: {
        sequencerModel: SequencerModel,
    },
    components: {
        //Register,
        Multiplexer,
        Memory,
    },
    methods: {
        translate(integer) {
            return MMParser.translate(integer)
        },
    },
}
</script>
