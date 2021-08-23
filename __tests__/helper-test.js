import { test, expect } from '@jest/globals'
import Helper from '@/helper'

test('Json', () => {
    let json = {}

    expect(Helper.getJsonValues(json, 'registers')).toEqual([])

    json.registers = []

    expect(Helper.getJsonValues(json, 'registers')).toEqual([])

    json.registers.push({})

    expect(Helper.getJsonValues(json, 'registers')).toEqual([{}])

    json.registers[0]['x'] = 0

    expect(Helper.getJsonValues(json, 'registers')).toEqual([{ x: 0 }])

    json.registers.push({ x: 12, y: '15' })

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: 0 },
        { x: 12, y: '15' },
    ])

    json.props = []

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: 0 },
        { x: 12, y: '15' },
    ])

    json.props = {
        registers: {
            x: 0,
            y: 0,
            w: 0,
        },
    }

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: 0, y: 0, w: 0 },
        { x: 12, y: 0, w: 0 },
    ])

    json.props.registers = { x: [], y: 's', w: {} }

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: [], y: 's', w: {} },
        { x: [], y: '15', w: {} },
    ])

    json.props = {
        registers: {
            x: 0,
            y: 0,
            w: 0,
            bus: 'bus',
        },
        bus: {
            x: -1,
            y: 's',
        },
    }

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: 0, y: 0, w: 0, bus: 'bus' },
        { x: 12, y: 0, w: 0, bus: 'bus' },
    ])

    json.props.registers.bus = '$bus'

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: 0, y: 0, w: 0, bus: null },
        { x: 12, y: 0, w: 0, bus: null },
    ])

    json.registers[0].bus = { x: 72, y: 2 }
    json.registers[1].bus = []

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: 0, y: 0, w: 0, bus: { x: 72, y: 's' } },
        { x: 12, y: 0, w: 0, bus: null },
    ])

    json.props.bus.bus = '$bus'

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: 0, y: 0, w: 0, bus: { x: 72, y: 's', bus: null } },
        { x: 12, y: 0, w: 0, bus: null },
    ])

    json.registers[1].bus = null

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: 0, y: 0, w: 0, bus: { x: 72, y: 's', bus: null } },
        { x: 12, y: 0, w: 0, bus: null },
    ])

    json.props.bus.bus = '&bus'

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: 0, y: 0, w: 0, bus: { x: 72, y: 's', bus: [] } },
        { x: 12, y: 0, w: 0, bus: null },
    ])

    json.registers[0].bus.bus = []

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: 0, y: 0, w: 0, bus: { x: 72, y: 's', bus: [] } },
        { x: 12, y: 0, w: 0, bus: null },
    ])

    json.registers[0].bus.bus = [{}]

    expect(Helper.getJsonValues(json, 'registers', true)).toEqual([
        {
            x: 0,
            y: 0,
            w: 0,
            bus: {
                x: 72,
                y: 's',
                bus: [
                    {
                        x: -1,
                        y: 's',
                        bus: [],
                    },
                ],
            },
        },
        { x: 12, y: 0, w: 0, bus: null },
    ])
})

test('Value verify', () => {
    let value
    // Valeurs par défaut renvoyées
    expect(typeof Helper.verifyValue(value, 'number')).toEqual('number')
    expect(typeof Helper.verifyValue(value, 'object')).toEqual('object')
    expect(typeof Helper.verifyValue(value, 'string')).toEqual('string')
    expect(typeof Helper.verifyValue(value, 'boolean')).toEqual('boolean')
    expect(typeof Helper.verifyValue(value, 'bigint')).toEqual('bigint')
    expect(typeof Helper.verifyValue(value, 'function')).toEqual('function')
    expect(Array.isArray(Helper.verifyValue(value, 'array'))).toEqual(true)

    // Bon renvoi quand le type est bon
    value = 2
    expect(Helper.verifyValue(value, 'number')).toEqual(value)
    value = 'test'
    expect(Helper.verifyValue(value, 'string')).toEqual(value)
    value = { test: 'test' }
    expect(Helper.verifyValue(value, 'object')).toEqual(value)
    value = [1, 2, 3]
    expect(Helper.verifyValue(value, 'array')).toEqual(value)
    value = 75n
    expect(Helper.verifyValue(value, 'bigint')).toEqual(value)
    value = true
    expect(Helper.verifyValue(value, 'boolean')).toEqual(value)
    value = (test) => {
        return test
    }
    expect(Helper.verifyValue(value, 'function')).toEqual(value)

    // Bon renvoi du défault quand le type n'est pas bon
    value = 2
    let def = 'default'
    expect(Helper.verifyValue(value, 'string', def)).toEqual(def)
    value = 'test'
    def = 2
    expect(Helper.verifyValue(value, 'number', def)).toEqual(def)
    value = { test: 'test' }
    def = [1, 2, 3]
    expect(Helper.verifyValue(value, 'array', def)).toEqual(def)
    value = [1, 2, 3]
    def = { test: 'test' }
    expect(Helper.verifyValue(value, 'object', def)).toEqual(def)
    value = 'test'
    expect(Helper.verifyValue(value, 'object', def)).toEqual(def)
    value = 75
    def = 75n
    expect(Helper.verifyValue(value, 'bigint', 75n)).toEqual(def)
    value = 1
    def = true
    expect(Helper.verifyValue(value, 'boolean', def)).toEqual(def)

    // Test avec des instances de classes
    class Foo {
        Foo(x) {
            this.x = x
        }
    }
    value = new Foo(2)
    expect(Helper.verifyValue(value, Foo)).toEqual(value)
    value = {}
    expect(Helper.verifyValue(value, Foo)).toEqual(null)
    def = new Foo(1)
    expect(Helper.verifyValue(value, Foo, def)).toEqual(def)

    // Test avec des types absurdes
    expect(Helper.verifyValue(0, 'test')).toEqual(null)
    expect(Helper.verifyValue([], 'test')).toEqual(null)
    expect(Helper.verifyValue(new Foo(), 'test')).toEqual(null)
    expect(Helper.verifyValue({}, 'test')).toEqual(null)
    expect(Helper.verifyValue(null, 'test')).toEqual(null)
    expect(Helper.verifyValue(undefined, 'test')).toEqual(null)
    expect(Helper.verifyValue('test', 'test')).toEqual(null)
    expect(Helper.verifyValue(false, 'test')).toEqual(null)
    expect(Helper.verifyValue(0n, 'test')).toEqual(null)

    def = new Foo(3)

    expect(Helper.verifyValue(0, 'test', def)).toEqual(def)
    expect(Helper.verifyValue([], 'test', def)).toEqual(def)
    expect(Helper.verifyValue(new Foo(), 'test', def)).toEqual(def)
    expect(Helper.verifyValue({}, 'test', def)).toEqual(def)
    expect(Helper.verifyValue(null, 'test', def)).toEqual(def)
    expect(Helper.verifyValue(undefined, 'test', def)).toEqual(def)
    expect(Helper.verifyValue('test', 'test', def)).toEqual(def)
    expect(Helper.verifyValue(false, 'test', def)).toEqual(def)
    expect(Helper.verifyValue(0n, 'test', def)).toEqual(def)
})
