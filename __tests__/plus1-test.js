import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import Plus1 from '@/models/plus1-model'
import Clock from '@/models/clock'
import { int } from '@/integer'

const inputBus = new Bus()
const outputBus = new Bus()
new Plus1(inputBus, outputBus)

test('Output = input + 1', () => {
    inputBus.setValue(int(10))

    Clock.waitAndTick(5)

    expect(outputBus.getValue().toNumber()).toBe(11)
})
