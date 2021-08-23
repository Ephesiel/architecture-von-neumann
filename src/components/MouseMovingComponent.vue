<template>
    <div
        :style="`width: ${width}px; height: ${height}px;`"
        @mousedown="startDrag"
        @mousemove="doDrag"
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
        <!-- DEBUG
        <div
            :style="`width: ${sizes.componentWidth}px;
            height: ${sizes.componentHeight}px;
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
            <circle r="5" :cx="width / 2" :cy="height / 2" />
        </svg>
        -->
    </div>
</template>
<script>
export default {
    props: {
        width: Number,
        height: Number,
        componentWidth: Number,
        componentHeight: Number,
        scale: { type: Number, default: 1 },
    },
    data() {
        return {
            dragging: false,
            draggingPos: { x: 0, y: 0 },
            offset: { top: 0, left: 0 },
        }
    },
    computed: {
        sizes() {
            return {
                height: this.height,
                width: this.width,
                componentHeight: this.componentHeight * this.scale,
                componentWidth: this.componentWidth * this.scale,
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
        // Lorsque les tailles changent, on veut garder le même ratio du
        // composant interne visible
        // Si le changement implique un zoom, le zoom se fait depuis le centre
        sizes: function (newSizes, oldSizes) {
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
