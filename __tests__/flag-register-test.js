import { test, expect } from '@jest/globals'
import Bus from '@/models/bus-model'
import FlagRegister from '@/models/flag-register-model'
import Clock from '@/models/clock'
import Debug, { Level } from '@/debug'
import { uint } from '@/integer'

const iBus = new Bus(4, false)
const oBus = new Bus(1, false)

let a = 0
let b = 5

const fRegister = new FlagRegister(6, iBus, oBus)

function isANull() {
    return function () {
        return uint(Number(a === 0))
    }
}
function isBNull() {
    return function () {
        return uint(Number(b === 0))
    }
}

fRegister.setCondition(uint(0), isANull())
fRegister.setCondition(uint(1), isBNull())
Clock.waitAndTick(1, 1)

test('A is NULL', () => {
    iBus.setValue(uint(0))
    Clock.waitAndTick(1, 1)
    expect(oBus.getValue().toNumber()).toBe(1)
})

test('B is not NULL', () => {
    iBus.setValue(uint(1))
    Clock.waitAndTick(1, 1)
    expect(oBus.getValue().toNumber()).toBe(0)
})

test('A is not NULL', () => {
    iBus.setValue(uint(0))
    a = 5
    Clock.waitAndTick(1, 1)
    expect(oBus.getValue().toNumber()).toBe(0)
})

test('Error 1', () => {
    const sizeBefore = Debug.getMessages(Level.ERROR).length
    fRegister.setCondition(uint(6), () => {
        return 0
    })
    expect(Debug.getMessages(Level.ERROR).length).toBe(sizeBefore + 1)
})

test('Error 2', () => {
    const sizeBefore = Debug.getMessages(Level.ERROR).length
    fRegister.getCondition(uint(6))
    expect(Debug.getMessages(Level.ERROR).length).toBe(sizeBefore + 1)
})

test('0 on a condition not set', () => {
    iBus.setValue(5)
    Clock.waitAndTick(1, 1)
    expect(oBus.getValue().toNumber()).toBe(0)
})
