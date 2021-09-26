<template>
    <g :transform="`translate(${x}, ${y})`" :width="w" :height="h">
        <rect
            v-if="border !== ''"
            :width="w"
            :height="h"
            :stroke="border"
            :fill="background"
            stroke-width="0.1"
        />
        <text :x="w / 2" :y="h / 2" v-if="content.indexOf('\n') > -1">
            <tspan
                v-for="line of content.split('\n')"
                :key="line"
                :x="w / 2"
                dy="1"
                >{{ line }}</tspan
            >
        </text>
        <text :x="w / 2" :y="h / 2" v-else>
            {{ content }}
        </text>
    </g>
</template>

<script>
export default {
    name: 'FloatingText',
    props: {
        x: Number,
        y: Number,
        w: Number,
        h: Number,
        border: String,
        stroke: String,
        background: String,
        content: String,
    },
}
</script>
