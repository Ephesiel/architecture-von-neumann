import { test, expect } from '@jest/globals'
import Clock from '@/models/clock'
import { ATU_BETWEEN_UPDATE } from '@/globals'
import SignalManager from '@/models/signal-manager'

test('Constructor', () => {
    expect(Clock.timePassedSinceStart()).toBe(0)
    expect(Clock.updateCallbacks.length).toBe(0)
    expect(ATU_BETWEEN_UPDATE).toBe(1)
})

test('Register', () => {
    let timePassed = 0
    let callTimes = 0
    let totest = (ATU, signals) => {
        expect(isNaN(ATU)).toBe(false)
        expect(signals).toBeInstanceOf(Object)
        expect(ATU).toBe(timePassed)
        callTimes++
    }

    Clock.register((ATU, signals) => {
        totest(ATU, signals)
    })

    timePassed = 10
    Clock.wait(10)
    Clock.tick()
    expect(callTimes).toBe(1)

    timePassed = 2
    Clock.waitAndTick(10, 2)
    expect(callTimes).toBe(6)

    timePassed = ATU_BETWEEN_UPDATE
    Clock.waitAndTick(ATU_BETWEEN_UPDATE * 3)
    expect(callTimes).toBe(9)

    expect(Clock.timePassedSinceStart()).toBe(20 + ATU_BETWEEN_UPDATE * 3)

    let waitTime = 5
    let lastWaitTime = 3
    let lastWait = false

    totest = (ATU) => {
        if (!lastWait && ATU === lastWaitTime) {
            lastWait = true
            return
        }

        expect(ATU).toBe(waitTime)
        expect(lastWait).toBe(false)
    }

    Clock.waitAndTick(13, 5)

    Clock.updateCallbacks = []

    let obj = { a: 0, b: 1 }
    const signal = Object.keys(SignalManager.signals)[0]

    Clock.register(obj, (o, ATU, signals) => {
        expect(o.a).toBe(1)
        expect(o.b).toBe(1)
        expect(o.a).toBe(obj.a)
        expect(o.b).toBe(obj.b)

        o.a = 2
        o.b = 2

        expect(o.a).toBe(obj.a)
        expect(o.b).toBe(obj.b)

        expect(ATU).toBe(1)
        expect(signals).toBeInstanceOf(Object)
        expect(signals[signal]).toBe(1)
    })

    obj.a = 1
    obj.b = 1

    SignalManager.emit(signal, 1)
    Clock.waitAndTick(1, 1)

    Clock.updateCallbacks = []
    Clock.register()

    expect(Clock.updateCallbacks.length).toBe(0)
})
