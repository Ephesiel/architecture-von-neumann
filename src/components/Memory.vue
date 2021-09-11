<template>
    <g :transform="transform">
        <Button
            :x="compsGeometry.button.x"
            :y="compsGeometry.button.y"
            :width="compsGeometry.button.w"
            :height="compsGeometry.button.h"
            activatedText="Toutes les données sont affichées."
            deactivatedText="Seulement les données existantes sont affichées."
            activatedColor="#ccff66"
            deactivatedColor="#ffcc66"
            @click="buttonClicked()"
            v-show="showButton"
        />

        <foreignObject
            :width="compsGeometry.table.w"
            :height="`${compsGeometry.table.h}px`"
            :x="compsGeometry.table.x"
            :y="compsGeometry.table.y"
        >
            <body xmlns="http://www.w3.org/1999/xhtml">
                <table
                    :style="{
                        height: `${compsGeometry.table.h}px`,
                        fontSize: `${fontSize}px`,
                    }"
                >
                    <tbody
                        id="scrollableBody"
                        :style="{
                            width: '100%',
                            height: `${compsGeometry.table.h}px`,
                        }"
                    >
                        <tr>
                            <th>Adresse</th>
                            <th>Contenu</th>
                            <th>Traduction</th>
                        </tr>
                        <tr v-for="(obj, index) in shouldRender" :key="index">
                            <td>{{ obj.address }}</td>
                            <td>{{ obj.content.toBinary() }}</td>
                            <td>{{ obj.translation }}</td>
                        </tr>
                    </tbody>
                </table>
            </body>
        </foreignObject>

        <g v-show="canScroll">
            <polygon
                fill="black"
                stroke="black"
                stroke-width="0.1"
                :points="getPoints('L')"
                class="scrollTriangle"
            />
            <text
                :x="width / 2"
                :y="compsGeometry.scroll.y + 0.05 * height"
                :font-size="fontSize"
                >Scroll</text
            >
            <polygon
                fill="black"
                stroke="black"
                stroke-width="0.1"
                :points="getPoints('R')"
                class="scrollTriangle"
            />
        </g>
    </g>
</template>

<script>
import Helper from '@/helper'
import MemoryModel from '@/models/memory/memory-model'
import architectureStyle from '@/view-datas/architecture-style.json'
import { uint } from '@/integer'
import Button from '@/components/Button.vue'

export default {
    name: 'Memory',
    components: {
        Button,
    },
    props: {
        memoryModel: MemoryModel,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        dataProcessor: Function,
        showButton: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            fontSize: architectureStyle.fontSize,
            displayAll: false,
            canScroll: true,
            scrolled: 0,
        }
    },
    computed: {
        transform() {
            return Helper.transform(this.x, this.y)
        },
        memoryData() {
            const data = []
            for (let i = 0; i < this.memoryModel.memory.length; ++i) {
                const val = this.memoryModel.getValue(uint(i))
                data.push({
                    address: i,
                    content: val,
                    translation: this.dataProcessor(val),
                })
            }
            return data
        },
        shouldRender() {
            if (this.displayAll) {
                return this.memoryData
            }
            return this.memoryData.filter((v) => {
                return v.content.neq(0)
            })
        },
        compsGeometry() {
            const button = {
                x: 0,
                y: 0,
                w: this.width,
                h: this.showButton ? 3 : 0,
            }
            const table = {
                x: 0,
                y: button.h,
                w: this.width,
                h: 0.9 * this.height - button.h,
            }
            const scroll = {
                x: 0,
                y: button.h + table.h,
            }
            return {
                button: button,
                table: table,
                scroll: scroll,
            }
        },
    },
    methods: {
        buttonClicked() {
            this.displayAll = !this.displayAll

            this.scrolled = 0
            this.scrollBody(-1)
        },
        getPoints(side) {
            const topY = 0.95 * this.height - 0.3
            const botY = 0.95 * this.height + 0.3
            const sideShift = this.width / 100

            const calculatePoints = function (start, side) {
                let sideX = start + side * sideShift
                return `${start},${topY} ${sideX},${topY} ${
                    (start + sideX) / 2
                },${botY}`
            }

            if (side === 'L') {
                return calculatePoints(this.width / 2 - 4, 1)
            } else {
                return calculatePoints(this.width / 2 + 4, -1)
            }
        },
        scroll(event) {
            event.preventDefault()

            this.scrollBody(Math.sign(event.deltaY))
        },
        scrollBody(sign) {
            const scrollableBody = document.getElementById('scrollableBody')
            const headRow = document.querySelector(
                '#scrollableBody tr:first-child'
            )

            this.scrolled += sign

            // Hauteur de la table - 1 ligne (la ligne header sticky)
            const top =
                this.scrolled * this.compsGeometry.table.h -
                headRow.clientHeight

            if (this.scrolled < 0 || top > scrollableBody.scrollTopMax) {
                this.scrolled -= sign
            }

            // Désafficher « Scroll » si c'est la fin de la table
            this.canScroll = top <= scrollableBody.scrollTopMax

            scrollableBody.scroll({
                top: top,
                behavior: 'smooth',
            })
        },
    },
    mounted() {
        const scrollableBody = document.getElementById('scrollableBody')
        scrollableBody.onwheel = this.scroll.bind(this)

        this.canScroll = scrollableBody.scrollTopMax !== 0
    },
    created() {
        this.displayAll = !this.showButton
    },
}
</script>

<style lang="scss" scoped>
table {
    display: table;
    text-align: center;
    border-collapse: collapse;
    border-spacing: 2px;
    width: 100% !important;
    line-height: 1 !important;

    td:last-child {
        width: 100%;
    }

    tr:nth-child(odd) {
        background: rgba(0, 0, 0, 0.05);
    }

    tr {
        display: table-row;
        border-color: inherit;

        ::after {
            box-sizing: border-box;
        }
    }

    tbody th {
        position: sticky;
        top: 0;
        z-index: 100;
        background: #f2f2f2;
    }
}

foreignObject > body {
    margin: 0;
    margin-top: 0.05rem;
}

#scrollableBody {
    overflow-y: auto;
    overflow-x: hidden;
    display: inline-block;
    -ms-overflow-style: none; /* IE & Edge */
    scrollbar-width: none; /* Firefox */
}

#scrollableBody::-webkit-scrollbar {
    display: none;
}

@keyframes float {
    0% {
        transform: translatey(0px);
    }
    33% {
        transform: translatey(0.1px);
    }
    66% {
        transform: translatey(-0.1px);
    }
    100% {
        transform: translatey(0px);
    }
}

.scrollTriangle {
    animation: float 2s linear infinite;
}
</style>
