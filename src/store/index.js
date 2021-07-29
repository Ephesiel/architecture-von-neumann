import { createStore } from 'vuex'
import SignalManager from '@/models/signal-manager'

const page = document.getElementsByTagName('html')[0]

const store = createStore({
    state: {
        pageWidth: 1000,
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
        changeSize: (state, page) => {
            state.pageWidth = page.getBoundingClientRect().width
        },
    },
    actions: {},
    modules: {},
})

const resizeObserver = new ResizeObserver(function () {
    store.commit('changeSize', page)
})

resizeObserver.observe(page)

export default store
