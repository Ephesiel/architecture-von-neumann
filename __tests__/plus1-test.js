import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import Plus1 from '@/models/plus1-model'
import Clock from '@/models/clock'

const inputBus = new Bus()
const outputBus = new Bus()
new Plus1(inputBus, outputBus)

test('Output = input + 1', () => {
    inputBus.setValue(10)

    Clock.waitAndTick(5)

    expect(outputBus.getValue()).toBe(11n)
})
