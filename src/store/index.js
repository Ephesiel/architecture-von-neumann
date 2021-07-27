import { createStore } from 'vuex'
import SignalManager from '@/models/signal-manager'

export default createStore({
    state: {
        svgWidth: window.screen.availWidth / 2,
        svgHeight: window.screen.availHeight / 2,
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
    actions: {},
    modules: {},
})
