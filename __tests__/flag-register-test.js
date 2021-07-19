import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import FlagRegister from '@/models/flag-register-model'
import Clock from '@/models/clock'
import Debug, { Level } from '@/debug'

const iBus = new Bus(4)
const oBus = new Bus(1)

let a = 0
let b = 5

const fRegister = new FlagRegister(6, iBus, oBus)

function isANull() {
    return function () {
        return Number(a === 0)
    }
}
function isBNull() {
    return function () {
        return Number(b === 0)
    }
}

fRegister.setCondition(0, isANull())
fRegister.setCondition(1, isBNull())
Clock.waitAndTick(1, 1)

test('A is NULL', () => {
    iBus.setValue(0)
    Clock.waitAndTick(1, 1)
    expect(oBus.getValue()).toBe(1n)
})

test('B is not NULL', () => {
    iBus.setValue(1)
    Clock.waitAndTick(1, 1)
    expect(oBus.getValue()).toBe(0n)
})

test('A is not NULL', () => {
    iBus.setValue(0)
    a = 5
    Clock.waitAndTick(1, 1)
    expect(oBus.getValue()).toBe(0n)
})

test('Error 1', () => {
    const sizeBefore = Debug.getMessages(Level.ERROR).length
    fRegister.setCondition(6, () => {
        return 0
    })
    expect(Debug.getMessages(Level.ERROR).length).toBe(sizeBefore + 1)
})

test('Error 2', () => {
    const sizeBefore = Debug.getMessages(Level.ERROR).length
    fRegister.getCondition(6)
    expect(Debug.getMessages(Level.ERROR).length).toBe(sizeBefore + 1)
})
