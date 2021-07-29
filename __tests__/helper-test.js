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

    json.globals = []

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: 0 },
        { x: 12, y: '15' },
    ])

    json.globals = {
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

    json.globals.registers = { x: [], y: 's', w: {} }

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: [], y: 's', w: {} },
        { x: [], y: '15', w: {} },
    ])

    json.globals = {
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

    json.globals.registers.bus = '$bus'

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

    json.globals.bus.bus = '$bus'

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: 0, y: 0, w: 0, bus: { x: 72, y: 's', bus: null } },
        { x: 12, y: 0, w: 0, bus: null },
    ])

    json.registers[1].bus = null

    expect(Helper.getJsonValues(json, 'registers')).toEqual([
        { x: 0, y: 0, w: 0, bus: { x: 72, y: 's', bus: null } },
        { x: 12, y: 0, w: 0, bus: null },
    ])

    json.globals.bus.bus = '&bus'

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
