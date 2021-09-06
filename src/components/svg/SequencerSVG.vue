<template>
    <MouseMovingComponent
        :width="realWidth"
        :height="realHeight"
        :maxScale="500"
        style="border: 1px solid black"
    >
        <svg
            version="1.1"
            baseProfile="full"
            :viewBox="`0 0 ${width} ${height}`"
            width="100%"
            height="100%"
            :stroke-width="strokeWidth"
            :font-size="fontSize"
            :fill="fontColor"
            xmlns="http://www.w3.org/2000/svg"
            style="overflow: visible"
        >
            <Sequencer :sequencer-model="sequencerModel" />
            Désolé, votre navigateur ne supporte pas le SVG.
        </svg>
    </MouseMovingComponent>
</template>

<script>
import MouseMovingComponent from '@/components/MouseMovingComponent.vue'
import Sequencer from '@/components/Sequencer.vue'
import SequencerModel from '@/models/sequencer'
import sequencerStyle from '@/view-datas/sequencer-style.json'

export default {
    components: {
        MouseMovingComponent,
        Sequencer,
    },
    props: {
        sequencerModel: SequencerModel,
    },
    data() {
        return {
            width: sequencerStyle.svgWidth,
            height: sequencerStyle.svgHeight,
            fontSize: sequencerStyle.fontSize,
            fontColor: sequencerStyle.fontColor,
            strokeWidth: sequencerStyle.elementStrokeWidth,
        }
    },
    computed: {
        realWidth() {
            return this.$store.state.page.sequencerWidth
        },
        realHeight() {
            return this.realWidth * (this.height / this.width)
        },
    },
}
</script>
