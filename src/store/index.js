import { createStore } from 'vuex'

export default createStore({
    state: {
        svgWidth: window.screen.availWidth,
        svgHeight: window.screen.availHeight,
        calculateFontSize: function (text, maxWidth, maxHeight) {
            let minSize = 1
            let maxSize = 128
            let size = 1

            do {
                size = Math.round((minSize + maxSize) / 2)
                const m = this.calculateSize(text, `${size}px arial`)

                if (m.w > maxWidth || m.h > maxHeight) {
                    maxSize = size
                } else if (m.w <= maxWidth && m.h <= maxHeight) {
                    minSize = size
                }
            } while (minSize + 1 !== maxSize)

            return minSize
        },
        calculateSize: function (text, font) {
            const canvas =
                this.calculateSize.canvas ||
                (this.calculateSize.canvas = document.createElement('canvas'))
            const context = canvas.getContext('2d')
            context.font = font
            const metrics = context.measureText(text)
            return {
                w: Math.ceil(metrics.width),
                h:
                    metrics.fontBoundingBoxAscent +
                    metrics.fontBoundingBoxDescent,
            }
        },
    },
    mutations: {},
    actions: {},
    modules: {},
})
