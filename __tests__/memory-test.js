import { test, expect } from '@jest/globals'
import Memory from '@/models/memory/memory-model'
import Debug, { Level } from '@/debug'

const memory = new Memory(4, 10)

test('Constructor', () => {
    expect(memory.maxValue).toBe(1023n)
    expect(memory.memory.length).toBe(16)
})

test('Set good value', () => {
    memory.setValue(8, 500)
    expect(memory.getValue(8)).toBe(500n)
})

test('Set bad value', () => {
    const critMessages = Debug.getMessages(Level.CRIT)
    const size = critMessages.length
    memory.setValue(8, 1050)
    expect(critMessages.length).toBe(size + 1)
    memory.setValue(20, 4)
    expect(critMessages.length).toBe(size + 2)
    memory.setValue(8, '0')
    expect(critMessages.length).toBe(size + 3)
    memory.getValue(20)
    expect(critMessages.length).toBe(size + 4)
})

test('Get non instantiated value', () => {
    const warnMessages = Debug.getMessages(Level.WARN)
    const size = warnMessages.length
    memory.getValue(5)
    expect(warnMessages.length).toBe(size + 1)
})
