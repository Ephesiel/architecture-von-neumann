<template>
    <div
        :style="`width: ${width}px;
        height: ${height}px; 
        overflow: ${overflow};`"
        @mousedown="startDrag"
        @mousemove="doDrag"
        class="moving-component-wrapper"
    >
        <div
            :style="`width: 100%;
            height: 100%;
            top: ${offset.top}px;
            left: ${offset.left}px;`"
            class="moving-component"
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
    },
    data() {
        return {
            dragging: false,
            draggingPos: { x: 0, y: 0 },
            offset: { top: 0, left: 0 },
        }
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
    mounted() {
        window.addEventListener('mouseup', this.stopDrag)
    },
}
</script>

<style lang="scss" scoped>
.moving-component-wrapper {
    position: relative;
}

.moving-component-wrapper .moving-component {
    position: absolute;
}
</style>
