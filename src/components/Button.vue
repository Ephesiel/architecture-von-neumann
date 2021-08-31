<template>
    <g
        :transform="transform"
        class="button"
        @click="updateToggledData"
        @mousedown="switchVeilDisplay()"
        @mouseup="switchVeilDisplay()"
    >
        <rect
            @click="updateToggledData"
            x="0"
            y="0"
            :width="width"
            :height="height"
            stroke="black"
            :fill="color"
        />

        <text
            :font-size="fontSize"
            :x="labelPoint.x"
            :y="labelPoint.y"
            class="unselectable"
            >{{ text }}</text
        >

        <rect
            x="0"
            y="0"
            :width="width"
            :height="height"
            stroke="black"
            fill="black"
            fill-opacity="0.1"
            v-show="isVeilShown"
        />
    </g>
</template>

<script>
import Helper from '@/helper'
import architectureStyle from '@/view-datas/architecture-style.json'

export default {
    name: 'Button',
    props: {
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        activatedText: String,
        deactivatedText: String,
        activatedColor: String,
        deactivatedColor: String,
    },
    emits: ['click'],
    data() {
        return {
            timesActivated: 0,
            text: '',
            color: '',
            fontSize: architectureStyle.fontSize,
            isVeilShown: false,
        }
    },
    computed: {
        transform() {
            return Helper.transform(this.x, this.y)
        },
        labelPoint() {
            return {
                x: this.width / 2,
                y: this.height / 2,
            }
        },
    },
    methods: {
        updateToggledData() {
            this.$emit('click')
            this.timesActivated++

            const isPair = (this.timesActivated & 1) == 0
            this.updateTextAndColor(isPair)
        },
        updateTextAndColor(isPair) {
            // Pair : 0, 2, 4, ... -> désactivé
            if (isPair) {
                this.text = this.deactivatedText
                this.color = this.deactivatedColor
            } else {
                // Impair
                this.text = this.activatedText
                this.color = this.activatedColor
            }
        },
        switchVeilDisplay() {
            this.isVeilShown = !this.isVeilShown
        },
    },
    created() {
        this.updateTextAndColor(true)
    },
}
</script>

<style lang="scss" scoped>
.unselectable {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

.button {
    cursor: pointer;
}
</style>
