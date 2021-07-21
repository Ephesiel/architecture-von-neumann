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
    expect(x.bit(-1)).toEqual(0)
    expect(x.bit(0)).toEqual(1)
    expect(x.bit(1)).toEqual(1)
    expect(x.bit(2)).toEqual(0)
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

test('Copy', () => {
    let x = int(-40, 32)
    let y = x.copy()

    expect(x.getSize()).toBe(y.getSize())
    expect(x.toNumber()).toBe(y.toNumber())
    expect(x.toBigInt()).toBe(y.toBigInt())
    expect(x.toBinary()).toBe(y.toBinary())
    expect(x.toString()).toBe(y.toString())
    expect(x.isNegative()).toBe(y.isNegative())

    x.size = 0

    expect(y.size).toBe(32)
})

test('Slice', () => {
    let x = int(-44, 8)
    let y = x.slice(0, 5)

    expect(x.toBinary()).toEqual('11010100')
    expect(y.toBinary()).toEqual('10100')
    expect(y.toNumber()).toEqual(-12)

    y.bits = [0, 0, 0, 0, 0]

    expect(y.toBinary()).toEqual('00000')
    expect(y.toNumber()).toEqual(0)
    expect(x.toBinary()).toEqual('11010100')
    expect(x.toNumber()).toEqual(-44)

    y = x.slice(7, 12)

    expect(y.toBinary()).toEqual('000000000001')
    expect(y.toNumber()).toEqual(1)
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

    x = int(2, 3, false)
    y = int(2, 3, false)
    z = x['+'](y)

    expect(z.toNumber()).toBe(4)
    expect(z.toBigInt()).toBe(4n)
    expect(z.toBinary()).toEqual('100')

    x = int(2, 3)
    y = int(2, 3)
    z = x['+'](y)

    expect(z.toNumber()).toBe(-4)
    expect(z.toBigInt()).toBe(-4n)
    expect(z.toBinary()).toEqual('100')

    x = int(2, 3)
    y = int(2, 5)
    z = x['+'](y)

    expect(z.toNumber()).toBe(4)
    expect(z.toBigInt()).toBe(4n)
    expect(z.toBinary()).toEqual('00100')

    x = int(2, 16)

    expect(x.add(-3).toNumber()).toBe(-1)
    expect(x.add(int(-3, 16)).toNumber()).toBe(-1)
    expect(x['+'](int(-3, 4)).toNumber()).toBe(15)
})

test('Opposite', () => {
    let x = int(3, 16)
    x = x['-']()

    expect(x.toNumber()).toBe(-3)
    expect(x.toBigInt()).toBe(-3n)
    expect(x.toBinary()).toEqual('1111111111111101')

    x = int(3, 16, false)
    x = x.opposite()

    expect(x.toNumber()).toBe(65533)
    expect(x.toBigInt()).toBe(65533n)
    expect(x.toBinary()).toEqual('1111111111111101')
})

test('Shift', () => {
    let x = int(5, 8)
    let y = x.leftShift(3)
    let z = y['<<'](3)

    expect(x.toBinary()).toEqual('00000101')
    expect(y.toBinary()).toEqual('00101000')
    expect(z.toBinary()).toEqual('01000000')

    x = int(-5, 8)
    y = x.rightShift(3)
    z = y['>>'](3)

    expect(x.toBinary()).toEqual('11111011')
    expect(y.toBinary()).toEqual('00011111')
    expect(z.toBinary()).toEqual('00000011')
})

test('Logic', () => {
    let x = int(5, 8)
    let y = int(-431, 12)
    let z = int(-13, 8)

    expect(x.toBinary()).toEqual('00000101')
    expect(y.toBinary()).toEqual('111001010001')
    expect(z.toBinary()).toEqual('11110011')

    // not
    expect(x.not().toBinary()).toEqual('11111010')
    expect(y.not().toBinary()).toEqual('000110101110')
    expect(z['~']().toBinary()).toEqual('00001100')

    // or
    expect(x.or(y).toNumber()).toBe(y.or(x).toNumber())
    expect(x.or(z).toNumber()).toBe(z.or(x).toNumber())
    expect(y['|'](z).toNumber()).toBe(z.or(y).toNumber())

    expect(x.or(y).toBinary()).toEqual('111001010101')
    expect(x.or(z).toBinary()).toEqual('11110111')
    expect(y['|'](z).toBinary()).toEqual('111011110011')

    // and
    expect(x.and(y).toNumber()).toBe(y.and(x).toNumber())
    expect(x.and(z).toNumber()).toBe(z.and(x).toNumber())
    expect(y['&'](z).toNumber()).toBe(z.and(y).toNumber())

    expect(x.and(y).toBinary()).toEqual('000000000001')
    expect(x.and(z).toBinary()).toEqual('00000001')
    expect(y['&'](z).toBinary()).toEqual('000001010001')

    // xor
    expect(x.xor(y).toNumber()).toBe(y.xor(x).toNumber())
    expect(x.xor(z).toNumber()).toBe(z.xor(x).toNumber())
    expect(y['^'](z).toNumber()).toBe(z.xor(y).toNumber())

    expect(x.xor(y).toBinary()).toEqual('111001010100')
    expect(x.xor(z).toBinary()).toEqual('11110110')
    expect(y['^'](z).toBinary()).toEqual('111010100010')
})
