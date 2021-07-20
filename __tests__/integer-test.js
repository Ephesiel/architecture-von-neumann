import { test, expect } from '@jest/globals'
import { int } from '@/integer'

test('Basic', () => {
    let x = int(0, 32)

    expect(x.toNumber()).toBe(0)
    expect(x.toBigInt()).toBe(0n)
    expect(x.toBinary()).toEqual('00000000000000000000000000000000')
    expect(x.toString()).toEqual('0')
    expect(x.getSize()).toEqual(32)

    x = int(72, 32)

    expect(x.toNumber()).toBe(72)
    expect(x.toBigInt()).toBe(72n)
    expect(x.toBinary()).toEqual('00000000000000000000000001001000')
    expect(x.toString()).toEqual('72')
    expect(x.getSize()).toEqual(32)
})

test('Unsigned', () => {
    let x = int(0, 32, false)

    expect(x.toNumber()).toBe(0)
    expect(x.toBigInt()).toBe(0n)
    expect(x.toBinary()).toEqual('00000000000000000000000000000000')

    x = int(2 ** 16 - 1, 16, false)

    expect(x.toNumber()).toBe(65535)
    expect(x.toBigInt()).toBe(65535n)
    expect(x.toBinary()).toEqual('1111111111111111')

    x = int(2 ** 16, 16, false)

    expect(x.toNumber()).toBe(0)
    expect(x.toBigInt()).toBe(0n)
    expect(x.toBinary()).toEqual('0000000000000000')

    x = int(2 ** 16 - 1, 16)

    expect(x.toNumber()).toBe(-1)
    expect(x.toBigInt()).toBe(-1n)
    expect(x.toBinary()).toEqual('1111111111111111')

    x = int(1, 1, false)

    expect(x.toNumber()).toBe(1)
    expect(x.toBigInt()).toBe(1n)
    expect(x.toBinary()).toEqual('1')

    x = int(1, 1, true)

    expect(x.toNumber()).toBe(-1)
    expect(x.toBigInt()).toBe(-1n)
    expect(x.toBinary()).toEqual('1')
})

test('Big integer', () => {
    let x = int(0, 64)

    expect(x.toBigInt()).toBe(0n)
    expect(x.toBinary()).toEqual(
        '0000000000000000000000000000000000000000000000000000000000000000'
    )

    x = int(-1, 64)

    expect(x.toBigInt()).toBe(-1n)
    expect(x.toBinary()).toEqual(
        '1111111111111111111111111111111111111111111111111111111111111111'
    )

    x = int(9223372036854775807n, 64)

    expect(x.toBigInt()).toBe(9223372036854775807n)
    expect(x.toBinary()).toEqual(
        '0111111111111111111111111111111111111111111111111111111111111111'
    )

    x = int(-9223372036854775808n, 64)

    expect(x.toBigInt()).toBe(-9223372036854775808n)
    expect(x.toBinary()).toEqual(
        '1000000000000000000000000000000000000000000000000000000000000000'
    )
})

test('From iterable', () => {
    let x = int('0011', 16)

    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('0000000000000011')

    x = int('1111', 2)

    expect(x.toNumber()).toBe(-1)
    expect(x.toBigInt()).toBe(-1n)
    expect(x.toBinary()).toEqual('11')

    x = int([0, 0, 1, 1], 16)

    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('0000000000000011')

    x = int([1, 1, 1, 1], 2)

    expect(x.toNumber()).toBe(-1)
    expect(x.toBigInt()).toBe(-1n)
    expect(x.toBinary()).toEqual('11')
})

test('Strange values', () => {
    let x = int(null, 16)

    expect(x.toNumber()).toBe(0)
    expect(x.toBigInt()).toBe(0n)
    expect(x.toBinary()).toEqual('0000000000000000')

    x = int(0, '16')

    expect(x.toNumber()).toBe(0)
    expect(x.toBigInt()).toBe(0n)
    expect(x.toBinary()).toEqual('0000000000000000')

    x = int(0, 'lol')

    expect(x.toNumber()).toBe(0)
    expect(x.toBigInt()).toBe(0n)
    expect(x.toBinary()).toEqual('0')
})

test('Bits', () => {
    let x = int(-5, 4)

    expect(x.toBinary()).toEqual('1011')
    expect(x.bit(0)).toEqual(1)
    expect(x.bit(1)).toEqual(0)
    expect(x.bit(2)).toEqual(1)
    expect(x.bit(3)).toEqual(1)
    expect(x.bit(4)).toEqual(0)
    expect(x.bit(5)).toEqual(0)
})

test('Size', () => {
    let x = int(3, 4)
    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('0011')

    x = x.truncate(1)
    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('011')

    x = x.truncate(1)
    expect(x.toNumber()).toBe(-1)
    expect(x.toBigInt()).toBe(-1n)
    expect(x.toBinary()).toEqual('11')

    x = x.truncate(1)
    expect(x.toNumber()).toBe(-1)
    expect(x.toBigInt()).toBe(-1n)
    expect(x.toBinary()).toEqual('1')

    x = x.truncate(1)
    expect(x.toNumber()).toBe(-1)
    expect(x.toBigInt()).toBe(-1n)
    expect(x.toBinary()).toEqual('1')

    x = int(3, 4, false)
    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('0011')

    x = x.truncate(1)
    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('011')

    x = x.truncate(1)
    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('11')

    x = x.truncate(1)
    expect(x.toNumber()).toBe(1)
    expect(x.toBigInt()).toBe(1n)
    expect(x.toBinary()).toEqual('1')

    x = x.truncate(1)
    expect(x.toNumber()).toBe(1)
    expect(x.toBigInt()).toBe(1n)
    expect(x.toBinary()).toEqual('1')
})

test('Addition', () => {
    let x = int(3, 16)
    let y = int(3, 16)
    let z = x['+'](y)

    expect(z.toNumber()).toBe(y['+'](x).toNumber())
    expect(z.toNumber()).toBe(6)
    expect(z.toBigInt()).toBe(6n)
    expect(z.toBinary()).toEqual('0000000000000110')

    x = int(2, 16)
    y = int(-5, 16)
    z = x['+'](y)

    expect(z.toNumber()).toBe(y['+'](x).toNumber())
    expect(z.toNumber()).toBe(-3)
    expect(z.toBigInt()).toBe(-3n)
    expect(z.toBinary()).toEqual('1111111111111101')

    x = int(2, 16)
    z = x['+'](-8)

    expect(z.toNumber()).toBe(-6)
    expect(z.toBigInt()).toBe(-6n)
    expect(z.toBinary()).toEqual('1111111111111010')
})
