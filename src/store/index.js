import { createStore } from 'vuex'
import SignalManager from '@/models/signal-manager'

/**
 * Module correspondant aux détails du moteur
 * On y retrouve les différents signaux et leur état
 */
const moduleEngine = {
    state: {
        signals: Object.fromEntries(
            Object.entries(SignalManager.getSignals()).map((o) => {
                return [o[0], o[1] !== 0]
            })
        ),
    },
    mutations: {
        resetSignals: (state) => {
            Object.keys(state.signals).forEach(
                (s) => (state.signals[s] = false)
            )
        },
        addSignal: (state, signal) => {
            state.signals[signal] = true
        },
    },
}

/**
 * Module sur les détails de la page : dimensions, agencement etc...
 */
const modulePage = {
    state: {
        width: 1000,
    },
    mutations: {
        changePageSize: (state, page) => {
            state.width = page.getBoundingClientRect().width
        },
    },
}

const store = createStore({
    modules: {
        engine: moduleEngine,
        page: modulePage,
    },
})

// On change la taille de la page en fonction de la fenêtre
const page = document.getElementsByTagName('body')[0]

new ResizeObserver(function () {
    store.commit('changePageSize', page)
}).observe(page)

export default store
