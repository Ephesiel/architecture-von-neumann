<template>
    <div
        :style="`width: ${width}px; height: ${height}px;`"
        @mousedown="startDrag"
        @mousemove="doDrag"
        @wheel="changeScale"
        class="moving-component-wrapper"
    >
        <div
            :style="`width: ${componentWidth}px;
            height: ${componentHeight}px;
            top: ${offset.top}px;
            left: ${offset.left}px;`"
            class="moving-component"
        >
            <slot></slot>
        </div>
        <div
            :style="`width: ${componentWidth}px;
            height: ${componentHeight}px;
            top: ${offset.top}px;
            left: ${offset.left}px;
            border: 1px solid black`"
            class="moving-component"
        ></div>
        <svg
            version="1.1"
            baseProfile="full"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            class="moving-component"
            style="top: 0; left: 0"
        >
            <circle r="5" :cx="center.x" :cy="center.y" />
        </svg>
    </div>
</template>
<script lang="ts">
export default {
    props: {
        width: Number,
        height: Number,
        componentWidth: Number,
        componentHeight: Number,
    },
    data() {
        return {
            dragging: false,
            draggingPos: { x: 0, y: 0 },
            offset: { top: 0, left: 0 },
            test: { x: 0, y: 0 },
        }
    },
    computed: {
        center() {
            return {
                x: this.width / 2,
                y: this.height / 2,
            }
        },
    },
    methods: {
        startDrag(event) {
            // Uniquement le clic gauche (clic principal)
            if (event.button === 0) {
                this.dragging = true
                this.draggingPos.x = event.clientX - this.offset.left
                this.draggingPos.y = event.clientY - this.offset.top
            }
        },
        stopDrag() {
            this.dragging = false
        },
        doDrag(event) {
            if (this.dragging) {
                this.offset.left = event.clientX - this.draggingPos.x
                this.offset.top = event.clientY - this.draggingPos.y
                this.x = event.clientX
                this.y = event.clientY
            }
        },
    },
    watch: {
        componentWidth: function (newWidth, oldWidth) {
            const ratioLeft = (this.center.x - this.offset.left) / oldWidth
            this.offset.left = this.center.x - ratioLeft * newWidth
        },
        componentHeight: function (newHeight, oldHeight) {
            const ratioAbove = (this.center.y - this.offset.top) / oldHeight
            this.offset.top = this.center.y - ratioAbove * newHeight
        },
    },
    mounted() {
        window.addEventListener('mouseup', this.stopDrag)
    },
}
</script>

<style lang="scss" scoped>
.moving-component-wrapper {
    position: relative;
    overflow: hidden;
}

.moving-component-wrapper .moving-component {
    position: absolute;
}
</style>
