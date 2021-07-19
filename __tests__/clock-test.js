import { test, expect } from '@jest/globals'
import Clock from '@/models/clock'
import { ATU_BETWEEN_UPDATE } from '@/globals'

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
})
