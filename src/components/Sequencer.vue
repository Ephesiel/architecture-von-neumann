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
            :width="100"
            :height="200"
            :x="0"
            :y="100"
        />
        <Multiplexer
            :multiplexer-model="sequencerModel.phaseMult"
            :width="100"
            :height="200"
            :x="200"
            :y="100"
        />
    </g>
</template>

<script>
import SequencerModel from '@/models/sequencer'
//import Register from '@/components/Register.vue'
import Multiplexer from '@/components/Multiplexer.vue'

export default {
    name: 'Sequencer',
    props: {
        sequencerModel: SequencerModel,
    },
    components: {
        //Register,
        Multiplexer,
    },
    computed: {},
}
</script>
