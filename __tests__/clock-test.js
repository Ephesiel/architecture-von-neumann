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

    Clock.register((ATU, signals) => {
        expect(isNaN(ATU)).toBe(false)
        expect(signals).toBeInstanceOf(Object)
        expect(ATU).toBe(timePassed)
        callTimes++
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
})
