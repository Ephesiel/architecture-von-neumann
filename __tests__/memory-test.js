import { test, expect } from '@jest/globals'
import Memory from '@/models/memory/memory-model'
import Debug, { Level } from '@/debug'
import { maxOf, int, uint } from '@/integer'

const memory = new Memory(4, 10)

test('Constructor', () => {
    expect(maxOf(memory.width).toNumber()).toBe(1023)
    expect(memory.memory.length).toBe(16)
})

test('Set good value', () => {
    memory.setValue(uint(8), int(500))
    expect(memory.getValue(uint(8)).toNumber()).toBe(500)
})

test('Set bad value', () => {
    const critMessages = Debug.getMessages(Level.CRIT)
    const size = critMessages.length
    memory.setValue(uint(8), int(1050))
    expect(critMessages.length).toBe(size + 1)
    memory.setValue(uint(20), int(4))
    expect(critMessages.length).toBe(size + 2)
    memory.getValue(uint(20))
    expect(critMessages.length).toBe(size + 3)
    memory.setValue(null, uint(0))
    expect(critMessages.length).toBe(size + 4)
    memory.setValue(uint(0), 0)
    expect(critMessages.length).toBe(size + 5)
})

test('Get non instantiated value', () => {
    const warnMessages = Debug.getMessages(Level.WARN)
    const size = warnMessages.length
    memory.getValue(uint(5))
    expect(warnMessages.length).toBe(size + 1)
})
