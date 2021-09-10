<template>
    <svg
        version="1.1"
        baseProfile="full"
        :viewBox="`0 0 ${width} ${height}`"
        :stroke-width="strokeWidth"
        :font-size="fontSize"
        :fill="fontColor"
        xmlns="http://www.w3.org/2000/svg"
        style="overflow: visible"
    >
        <Memory
            :memory-model="memoryModel"
            :width="width"
            :height="height"
            :x="0"
            :y="0"
            :dataProcessor="() => 'bite'"
        />
        Désolé, votre navigateur ne supporte pas le SVG.
    </svg>
</template>

<script>
import MemoryModel from '@/models/memory/memory-model'
import Memory from '@/components/Memory.vue'
import memoryStyle from '@/view-datas/memory-style.json'

export default {
    components: {
        Memory,
    },
    props: {
        memoryModel: MemoryModel,
    },
    data() {
        return {
            width: memoryStyle.svgWidth,
            height: memoryStyle.svgHeight,
            fontSize: memoryStyle.fontSize,
            fontColor: memoryStyle.fontColor,
            strokeWidth: memoryStyle.elementStrokeWidth,
        }
    },
}
</script>
