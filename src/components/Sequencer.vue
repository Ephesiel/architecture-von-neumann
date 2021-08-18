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
            :width="75"
            :x="0"
            :y="200"
        />
        <Multiplexer
            :multiplexer-model="sequencerModel.phaseMult"
            :width="50"
            :x="200"
            :y="200"
        />
        <Memory
            :memory-model="sequencerModel.microprogammedMemory"
            :width="1000"
            :height="500"
            :x="-300"
            :y="400"
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
