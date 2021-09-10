<template>
    <div
        :style="`width: ${width}px; height: ${height}px;`"
        @mousedown="startDrag"
        @mousemove="doDrag"
        @wheel="changeScale"
        class="moving-component-wrapper"
    >
        <div
            :style="`width: ${sizes.componentWidth}px;
            height: ${sizes.componentHeight}px;
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
        wheelSpeed: { type: Number, default: 10 },
        maxScale: { type: Number, default: 200 },
        minScale: { type: Number, default: 50 },
        beginScale: { type: Number, default: 100 },
    },
    data() {
        return {
            scale: this.beginScale,
            dragging: false,
            draggingPos: { x: 0, y: 0 },
            offset: { top: 0, left: 0 },
        }
    },
    computed: {
        scaleRatio() {
            return this.scale / 100
        },
        sizes() {
            return {
                height: this.height,
                width: this.width,
                componentHeight: this.height * this.scaleRatio,
                componentWidth: this.width * this.scaleRatio,
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
        changeScale(event) {
            this.scale -= event.deltaY * 0.0001 * this.wheelSpeed * this.scale
            this.scale = Math.min(this.scale, this.maxScale)
            this.scale = Math.max(this.scale, this.minScale)
        },
    },
    watch: {
        // Lorsque les tailles changent, on veut garder le même ratio du
        // composant interne visible
        // Si le changement implique un zoom, le zoom se fait depuis le centre
        sizes: function (newSizes, oldSizes) {
            // Impossible de diviser par 0
            if (
                oldSizes.componentWidth === 0 ||
                oldSizes.componentHeight === 0
            ) {
                return
            }

            // Les centres
            const oldC = { x: oldSizes.width / 2, y: oldSizes.height / 2 }
            const newC = { x: newSizes.width / 2, y: newSizes.height / 2 }

            // Les pourcentage du composants situés en haut et à gauche du centre
            const ratio = {
                left: (oldC.x - this.offset.left) / oldSizes.componentWidth,
                above: (oldC.y - this.offset.top) / oldSizes.componentHeight,
            }

            // Le point en haut à gauche du composant change pour garder les
            // mêmes ratios en haut et à gauche du centre du cadre
            this.offset.left = newC.x - ratio.left * newSizes.componentWidth
            this.offset.top = newC.y - ratio.above * newSizes.componentHeight
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
