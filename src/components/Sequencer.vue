<template>
    <text :x="x" y="15" fill="black" id="title">Séquenceur</text>
    <Register
        :register-model="sequencerModel.REMM"
        :width="200"
        :height="100"
        :x="50"
        :y="50"
    />
</template>

<script>
import SequencerModel from '@/models/sequencer'
import Register from '@/components/Register.vue'

export default {
    name: 'Sequencer',
    props: {
        sequencerModel: SequencerModel,
    },
    components: {
        Register,
    },
    computed: {
        x() {
            return this.$store.state.svgWidth / 2 - 50
        },
    },
}
</script>
