<template>
    <g :transform="transform">
        <g class="button">
            <rect
                @click="updateToggledData"
                x="0"
                y="0"
                :width="width"
                :height="0.1 * height"
                stroke="black"
                :fill="displayAll ? yesColor : noColor"
            />
            <text
                @click="updateToggledData"
                :font-size="fontSize"
                :x="labelPoint.x"
                :y="labelPoint.y"
                class="unselectable"
                >{{ displayAll ? yesText : noText }}</text
            >
        </g>

        <foreignObject
            :width="width"
            :height="tableHeight"
            x="0"
            :y="0.1 * height"
        >
            <body xmlns="http://www.w3.org/1999/xhtml">
                <table
                    :style="{
                        height: tableHeight,
                        width: `calc(${width}px - .75rem)`,
                        fontSize: `${fontSize}px`,
                    }"
                    :class="{ scrollable: displayAll }"
                >
                    <thead>
                        <tr>
                            <th>Adresse</th>
                            <th>Contenu</th>
                            <th>Traduction</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(obj, index) in shouldRender" :key="index">
                            <td>{{ obj.address }}</td>
                            <td>{{ obj.content.toBinary() }}</td>
                            <td>{{ obj.translation }}</td>
                        </tr>
                    </tbody>
                </table>
            </body>
        </foreignObject>
    </g>
</template>

<script>
import Helper from '@/helper'
import MemoryModel from '@/models/memory/memory-model'
import { uint } from '@/integer'

export default {
    name: 'Memory',
    props: {
        memoryModel: MemoryModel,
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        dataProcessor: Function,
    },
    data() {
        return {
            displayAll: false,
            yesColor: '#ccff66',
            noColor: '#ffcc66',
            yesText: 'Toutes les données sont affichées.',
            noText: 'Seulement les données existantes sont affichées.',
            fontSize: this.$store.state.architecture.fontSize,
        }
    },
    computed: {
        transform() {
            return Helper.transform(this.x, this.y)
        },
        labelPoint() {
            return {
                x: this.width / 2,
                y: this.height / 20,
            }
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
        tableHeight() {
            return `${this.height * 0.9}px`
        },
    },
    methods: {
        updateToggledData() {
            this.displayAll = !this.displayAll
        },
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

table {
    display: block;
    text-align: center;
    border-collapse: collapse;
    border-spacing: 2px;
    overflow-x: auto;

    td:last-child {
        width: 100%;
    }

    tr:nth-child(even) {
        background: rgba(0, 0, 0, 0.05);
    }

    tr {
        display: table-row;
        border-color: inherit;

        ::after {
            box-sizing: border-box;
        }
    }

    th,
    td {
        padding: 0.75rem;
        vertical-align: top;
    }

    thead th {
        position: sticky;
        top: 0;
        z-index: 1;
        background: #f2f2f2;
    }

    &::-webkit-scrollbar {
        width: 10px;
    }
    &::-webkit-scrollbar-track {
        background: rgb(179, 177, 177);
        border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb {
        background: rgb(136, 136, 136);
        border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: rgb(100, 100, 100);
        border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb:active {
        background: rgb(68, 68, 68);
        border-radius: 10px;
    }
}

.button {
    cursor: pointer;
}

.scrollable {
    overflow-y: scroll;
}
</style>
