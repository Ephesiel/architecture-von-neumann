<template>
    <g>
        <!--<Register
            :register-model="sequencerModel.REMM"
            :width="200"
            :height="100"
            :x="50"
            :y="50"
        />-->
    </g>
</template>

<script>
import SequencerModel from '@/models/sequencer'
//import Register from '@/components/Register.vue'

export default {
    name: 'Sequencer',
    props: {
        sequencerModel: SequencerModel,
    },
    components: {
        //Register,
    },
    computed: {},
}
</script>
