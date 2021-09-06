<template>
    <div
        :style="`width: ${width}px;
        height: ${height}px; 
        overflow: ${overflow};`"
        @wheel="changeScale"
        class="zooming-component-wrapper"
    >
        <div
            :style="`width: ${componentWidth}px;
            height: ${componentHeight}px;
            top: ${top}px;
            left: ${left}px;
            overflow: ${overflow};`"
            class="zooming-component"
        >
            <slot></slot>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        width: Number,
        height: Number,
        overflow: { type: String, default: 'hidden' },
        wheelSpeed: { type: Number, default: 10 },
        maxScale: { type: Number, default: 200 },
        minScale: { type: Number, default: 50 },
        beginScale: { type: Number, default: 100 },
    },
    data() {
        return {
            scale: this.beginScale,
            offset: { top: 0, left: 0 },
        }
    },
    computed: {
        scaleRatio() {
            return this.scale / 100
        },
        componentHeight() {
            return this.height * this.scaleRatio
        },
        componentWidth() {
            return this.width * this.scaleRatio
        },
        top() {
            return (this.height - this.componentHeight) / 2
        },
        left() {
            return (this.width - this.componentWidth) / 2
        },
    },
    methods: {
        changeScale(event) {
            this.scale -= event.deltaY * 0.0001 * this.wheelSpeed * this.scale
            this.scale = Math.min(this.scale, this.maxScale)
            this.scale = Math.max(this.scale, this.minScale)
        },
    },
}
</script>

<style lang="scss" scoped>
.zooming-component-wrapper {
    position: relative;
}

.zooming-component-wrapper .zooming-component {
    position: absolute;
}
</style>
