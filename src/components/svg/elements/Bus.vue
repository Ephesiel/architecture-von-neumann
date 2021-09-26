<template>
    <template v-for="(bus, index) of nextBuses" :key="index">
        <path
            :d="path(bus)"
            :stroke="color"
            :stroke-width="width"
            :stroke-dasharray="powers[index] ? animationStrokeDasharray : 0"
            fill="none"
        >
            <animate
                v-if="powers[index]"
                dur="20000s"
                repeatCount="indefinite"
                attributeName="stroke-dashoffset"
                :by="
                    20 *
                        powerSpeed *
                        100 *
                        (!(powerFromSource ^ powerSwitchDirection) ? 1 : -1) +
                    '%'
                "
            />
        </path>
        <circle
            v-if="bus.insulator !== null"
            v-bind="insulatorDraw(bus)"
            :fill="
                powers[index] ? activeInsulatorColor : inactiveInsulatorColor
            "
            :stroke="insulatorStrokeColor"
            :stroke-width="insulatorStrokeWidth"
        />
        <path
            v-for="(arrow, indexArrow) of bus.arrows"
            :key="indexArrow"
            :d="pathForArrow(arrow, bus)"
            :stroke="color"
            :stroke-width="width"
            fill="none"
        />
        <Bus
            :datas="bus"
            :hasPower="hasPower"
            :model1="model1"
            :model2="model2"
            @power="onPower(index, $event)"
        />
    </template>
    <text
        v-for="(label, index) of labels"
        :key="index"
        :x="x + label.x"
        :y="y + label.y"
        font-weight="bold"
        >{{ name }}</text
    >
    <Signal
        v-for="(signal, index) of signals"
        :key="index"
        :x="x + signal.x"
        :y="y + signal.y"
        :signal="signal.name"
    />
</template>

<script>
import Signal from '@/components/svg/elements/Signal.vue'
import BusModel from '@/models/bus-model'
import { verifyValue } from '@/functions'
import architectureStyle from '@/view-datas/architecture-style.json'

export default {
    emits: ['power'],
    components: {
        Signal,
    },
    props: {
        datas: { type: Object, default: () => {} },
        model1: { type: BusModel },
        model2: { type: BusModel, default: null },
        // Peut prendre un paramètre qui est le composant lui-même
        // Renvoi un int sur 2 bits. Le premier représente si le courant passe
        // Le second représente la direction du courant 0 = pareil que le bus, 1 = sens inverse
        hasPower: {
            type: Function,
            default: () => {
                return 0
            },
        },
    },
    data() {
        return {
            // Si le courant est présent dans chaque branche
            powers: [],
            // Est-ce que le courant va dans le même sens que normalement
            powerSwitchDirection: false,

            width: architectureStyle.busWidth,
            powerSpeed: architectureStyle.busAnimationSpeed,
            animationStrokeDasharray:
                architectureStyle.busAnimationStrokeDasharray,

            inactiveInsulatorColor: architectureStyle.inactiveInsulatorColor,
            insulatorStrokeColor: architectureStyle.insulatorStrokeColor,
            insulatorStrokeWidth: architectureStyle.insulatorStrokeWidth,
            insulatorRadius: architectureStyle.insulatorRadius,
            activeInsulatorColor: architectureStyle.activeInsulatorColor,

            arrowSize: architectureStyle.busArrowSize,
            arrowAngle: architectureStyle.busArrowAngle,
        }
    },
    computed: {
        name() {
            return verifyValue(this.datas.name, 'string', 'Bus unamed')
        },
        x() {
            return verifyValue(this.datas.x, 'number')
        },
        y() {
            return verifyValue(this.datas.y, 'number')
        },
        ref() {
            return verifyValue(this.datas.ref, 'string')
        },
        color() {
            return verifyValue(this.datas.color, 'string', 'black')
        },
        powerFromSource() {
            return verifyValue(this.datas.powerFromSource, 'boolean')
        },
        signals() {
            return this.verifySignals(this.datas.signals)
        },
        labels() {
            return this.verifyLabels(this.datas.labels)
        },
        insulator() {
            return this.verifyInsulator(this.datas.insulator)
        },
        nextBuses() {
            return this.verifyNextBuses(this.datas.next)
        },
        power() {
            // La méthode n'est utile que sur les "feuilles" du bus
            // Le chemin de la racine vers la feuille qui a du courant aura
            // automatiquement du courant
            if (this.nextBuses.length === 0) {
                const result = this.hasPower(this)

                const power = {
                    isOn: (result & 1) === 1,
                    switchDirection: (result & 2) === 2,
                }

                return power
            }

            // Il faut renvoyer quelque chose, mais ce n'est pas utile
            // Il faut en revanche que ce soit constant, pour que la méthode
            // watch ne soit pas appelée
            return null
        },
    },
    mounted() {
        // Malgré le fait que `power` se recréer lorsque le bus se réaffiche,
        // la méthode watch n'est pas appelée. Si la méthode `sendPower` n'est
        // pas réappelée ici, alors les bus n'auront pas d'animation lorsqu'ils
        // réapparaitront.
        this.sendPower()
    },
    watch: {
        power: function () {
            this.sendPower()
        },
    },
    methods: {
        verifyLabels(labels) {
            labels = verifyValue(labels, 'array')

            for (const label of labels) {
                label.x = verifyValue(label.x, 'number')
                label.y = verifyValue(label.y, 'number')
            }

            return labels
        },
        verifyBridges(bridges) {
            bridges = verifyValue(bridges, 'array')

            for (const bridge of bridges) {
                bridge.dist = verifyValue(bridge.dist, 'number')
                bridge.size = verifyValue(bridge.size, 'number', 1)
            }

            // On trie les ponts car on en aura besoin pour faire le path
            // S'ils ne sont pas dans l'ordre, ça risque de faire un chemin étrange
            bridges.sort((b1, b2) => {
                return b1.dist > b2.dist ? 1 : b1.dist < b2.dist ? -1 : 0
            })

            return bridges
        },
        verifyArrows(arrows) {
            arrows = verifyValue(arrows, 'array')

            for (const arrow of arrows) {
                arrow.dist = verifyValue(arrow.dist, 'number')
                arrow.switch = verifyValue(arrow.switch, 'boolean')
            }

            return arrows
        },
        verifySignals(signals) {
            signals = verifyValue(signals, 'array')

            for (const signal of signals) {
                signal.name = verifyValue(signal.name, 'string')
                signal.x = verifyValue(signal.x, 'number')
                signal.y = verifyValue(signal.y, 'number')
                signal.switchDirection = verifyValue(
                    signal.switchDirection,
                    'boolean'
                )
            }

            return signals
        },
        verifyInsulator(insulator) {
            insulator = verifyValue(insulator, 'object')

            if (insulator !== null) {
                insulator.dist = verifyValue(insulator.dist, 'number')
            }

            return insulator
        },
        verifyNextBuses(nextBuses) {
            nextBuses = verifyValue(nextBuses, 'array')
            const nextB = []

            for (const bus of nextBuses) {
                // Deep copy à cause des + sur les coordonnées
                // Sinon lorsque l'objet est rerender, l'objet `datas` aura été
                // modifié, ce qu'il ne faut absolument pas faire
                const b = { ...bus }

                b.name = this.name
                b.color = this.color
                b.powerFromSource = this.powerFromSource
                b.x += this.x
                b.y += this.y
                b.arrows = this.verifyArrows(bus.arrows)
                b.bridges = this.verifyBridges(bus.bridges)
                b.signals = this.verifySignals(bus.signals)
                b.insulator = this.verifyInsulator(bus.insulator)

                nextB.push(b)
            }

            return nextB
        },
        sendPower() {
            if (this.power !== null) {
                this.$emit('power', this.power)
            }
        },
        onPower(index, power) {
            this.powers[index] = power.isOn
            this.powerSwitchDirection = power.isOn
                ? power.switchDirection
                : this.powerSwitchDirection

            // On vérifie si un des sous bus a encore du courant
            // En effet, si un bus envoi qu'il n'a plus de courant mais qu'un
            // autre en a toujours, il faut continuer de montrer que le courant
            // passe

            // Le cas où deux bus envoient du courant dans des directions
            // opposées n'est pas géré car il ne devrait jamais avoir lieu.
            // Dans ce genre de cas, le comportement sera sans doute étrange.
            power.isOn = this.powers.filter((p) => p === true).length > 0
            power.switchDirection = this.powerSwitchDirection
            this.$emit('power', power)
        },
        insulatorDraw(bus) {
            // Vecteur directeur
            const uv = this.multVector(this.unitVector(bus), -1)
            // Centre du cercle
            const center = this.projection(bus, bus.insulator.dist, uv)

            return {
                cx: center.x,
                cy: center.y,
                r: this.insulatorRadius / 2,
            }
        },
        path(bus) {
            let str = `M ${this.x} ${this.y}`

            // Vecteur directeur
            const uv = this.unitVector(bus)

            for (const bridge of bus.bridges) {
                // Rayon du demi-cercle
                const r = bridge.size / 2
                // Début du pont
                const begin = this.projection(this, bridge.dist - r, uv)
                // Fin du pont
                const end = this.projection(begin, bridge.size, uv)
                // Si le vecteur va vers la droite, le pont sera "au dessus"
                // Si le vecteur va vers la gauche, le pont sera "en dessous"
                const swip = uv.x > 0 ? 1 : 0

                str += `L ${begin.x} ${begin.y} A ${r} ${r} 0 0 ${swip} ${end.x} ${end.y}`
            }

            str += `L ${bus.x} ${bus.y}`
            return str
        },
        pathForArrow(arrow, bus) {
            const angle =
                ((this.powerFromSource ^ arrow.switch) * 180 +
                    this.arrowAngle) *
                (Math.PI / 180.0)
            const cosA = Math.cos(angle)
            const sinA = Math.sin(angle)
            const cosB = Math.cos(-angle)
            const sinB = Math.sin(-angle)

            // Vecteur directeur
            const uv = this.unitVector(bus)
            // Vecteur première branche
            const av = {
                x: cosA * uv.x - sinA * uv.y,
                y: sinA * uv.x + cosA * uv.y,
            }
            // Vecteur seconde branche
            const bv = {
                x: cosB * uv.x - sinB * uv.y,
                y: sinB * uv.x + cosB * uv.y,
            }
            // Pointe de la flèche
            const center = this.projection(this, arrow.dist, uv)
            // Première branche
            const pointA = this.projection(center, this.arrowSize / 2, av)
            // Seconde branche
            const pointB = this.projection(center, this.arrowSize / 2, bv)

            return `M ${pointA.x} ${pointA.y} L ${center.x} ${center.y} L ${pointB.x} ${pointB.y}`
        },
        unitVector(bus) {
            // Vecteur du segment du bus
            const v = {
                x: bus.x - this.x,
                y: bus.y - this.y,
            }

            // Longueur du segment
            const s = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2))

            // Vecteur unitaire
            return {
                x: v.x / s,
                y: v.y / s,
            }
        },
        projection(startingPoint, distance, unitVector) {
            return {
                x: distance * unitVector.x + startingPoint.x,
                y: distance * unitVector.y + startingPoint.y,
            }
        },
        multVector(v, t) {
            return {
                x: v.x * t,
                y: v.y * t,
            }
        },
    },
}
</script>

<style scoped></style>
