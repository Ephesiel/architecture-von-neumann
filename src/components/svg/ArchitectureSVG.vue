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
            <Architecture :architecture-model="architectureModel" />
            Désolé, votre navigateur ne supporte pas le SVG.
        </svg>
    </MouseMovingComponent>
</template>

<script>
import MouseMovingComponent from '@/components/MouseMovingComponent.vue'
import Architecture from '@/components/Architecture.vue'
import ArchitectureModel from '@/models/von-neumann-architecture-model'
import architectureStyle from '@/view-datas/architecture-style.json'

export default {
    components: {
        MouseMovingComponent,
        Architecture,
    },
    props: {
        architectureModel: ArchitectureModel,
    },
    data() {
        return {
            width: architectureStyle.svgWidth,
            height: architectureStyle.svgHeight,
            fontSize: architectureStyle.fontSize,
            fontColor: architectureStyle.fontColor,
            strokeWidth: architectureStyle.elementStrokeWidth,
        }
    },
    computed: {
        realWidth() {
            return this.$store.state.page.architectureWidth
        },
        realHeight() {
            return this.realWidth * (this.height / this.width)
        },
    },
}
</script>
