<!--
Petit tag qui peut ou non être supprimé en cliquant sur une croix
-->
<template>
    <span :class="`tag ${textColor}`" :style="`background-color: ${color}`">
        {{ text }}
        <a v-if="closable" @click="removeTag()">
            <svg width="14" height="14" viewBox="0 0 14 14">
                <path
                    d="M12 3.41L10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7z"
                ></path>
            </svg>
        </a>
    </span>
</template>

<script>
export default {
    name: 'Button',
    props: {
        text: String,
        closable: { type: Boolean, default: false },
        color: { type: String, default: 'black' },
    },
    emits: ['close'],
    computed: {
        textColor() {
            // Création d'un élément html pour pouvoir avoir une couleur en rgb
            // La forme de la couleur sera rgb[a](rr, gg, bb)
            const d = document.createElement('div')
            d.style.color = this.color
            document.body.appendChild(d)
            const c = window.getComputedStyle(d).color
            d.remove()

            const rgb = c
                .slice(c.lastIndexOf('(') + 1, c.lastIndexOf(')'))
                .split(', ')
            const red = rgb[0]
            const green = rgb[1]
            const blue = rgb[2]

            // La couleur du texte est en fonction de la couleur de fond
            return red * 0.299 + green * 0.587 + blue * 0.114 > 186
                ? 'light'
                : 'dark'
        },
    },
    methods: {
        removeTag() {
            this.$emit('close')
        },
    },
}
</script>

<style lang="scss">
.tag {
    a {
        position: relative;
        right: -0.2em;
        &:hover {
            cursor: pointer;
        }
        svg {
            position: relative;
            top: 0.2em;
        }
    }

    &.light {
        color: black;
        svg {
            fill: black;
        }
        a:hover {
            background-color: rgba($color: black, $alpha: 0.3);
        }
    }
    &.dark {
        color: white;
        svg {
            fill: white;
        }
        a:hover {
            background-color: rgba($color: white, $alpha: 0.3);
        }
    }

    padding: 0.1em 0.6em;
    border-radius: 5px;
    font-size: 0.8em;
}
</style>
