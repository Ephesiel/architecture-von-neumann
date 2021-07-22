import { test, expect } from '@jest/globals'
import { int, uint } from '@/integer'

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
    let x = int(0, 32)

    expect(x.toNumber()).toBe(0)
    expect(x.toBigInt()).toBe(0n)
    expect(x.toBinary()).toEqual('00000000000000000000000000000000')

    x = uint(2 ** 16 - 1, 16)

    expect(x.toNumber()).toBe(65535)
    expect(x.toBigInt()).toBe(65535n)
    expect(x.toBinary()).toEqual('1111111111111111')

    x = int(2 ** 16, 16)

    expect(x.toNumber()).toBe(0)
    expect(x.toBigInt()).toBe(0n)
    expect(x.toBinary()).toEqual('0000000000000000')

    x = int(2 ** 16 - 1, 16)

    expect(x.toNumber()).toBe(-1)
    expect(x.toBigInt()).toBe(-1n)
    expect(x.toBinary()).toEqual('1111111111111111')

    x = uint(1, 1)

    expect(x.toNumber()).toBe(1)
    expect(x.toBigInt()).toBe(1n)
    expect(x.toBinary()).toEqual('1')

    x = int(1, 1)

    expect(x.toNumber()).toBe(-1)
    expect(x.toBigInt()).toBe(-1n)
    expect(x.toBinary()).toEqual('1')
})

test('Conversion', () => {
    let x = int(1, 1)
    let y = x.toUint()
    let z = y.toInt()

    expect(x.toNumber()).toBe(-1)
    expect(x.toBigInt()).toBe(-1n)
    expect(x.toBinary()).toEqual('1')
    expect(y.toNumber()).toBe(1)
    expect(y.toBigInt()).toBe(1n)
    expect(y.toBinary()).toEqual('1')
    expect(z.toNumber()).toBe(-1)
    expect(z.toBigInt()).toBe(-1n)
    expect(z.toBinary()).toEqual('1')

    x = int(3, 3)
    y = x.toUint()
    z = y.toInt()

    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('011')
    expect(y.toNumber()).toBe(3)
    expect(y.toBigInt()).toBe(3n)
    expect(y.toBinary()).toEqual('011')
    expect(z.toNumber()).toBe(3)
    expect(z.toBigInt()).toBe(3n)
    expect(z.toBinary()).toEqual('011')
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

    x = uint(-1, 8)

    expect(x.toNumber()).toBe(255)
    expect(x.toBigInt()).toBe(255n)
    expect(x.toBinary()).toBe('11111111')
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

test('Truncate', () => {
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

    x = uint(3, 4)
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

    x = uint(3, 4)
    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('0011')

    x = x.extend(1)
    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('00011')

    x = x.extend(3)
    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('00000011')

    x = uint(3, 4)
    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('0011')

    x = x.removeZeroes()
    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('11')

    x = x.removeZeroes()
    expect(x.toNumber()).toBe(3)
    expect(x.toBigInt()).toBe(3n)
    expect(x.toBinary()).toEqual('11')
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

test('Absolute', () => {
    let x = int(3, 16)
    let y = x.abs()

    expect(x.toNumber()).toBe(3)
    expect(y.toNumber()).toBe(3)

    x = int(-3, 16)
    y = x.abs()

    expect(x.toNumber()).toBe(-3)
    expect(y.toNumber()).toBe(3)

    x = uint(-1, 8)
    y = x.abs()

    expect(x.toNumber()).toBe(255)
    expect(y.toNumber()).toBe(255)
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

    x = uint(2, 3)
    y = uint(2, 3)
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

    x = int(-128, 8)

    expect(x.add(255).toNumber()).toBe(127)
})

test('Subtraction', () => {
    let x = int(2, 4)
    let y = int(3, 8)
    let z = x.sub(y)

    expect(z.toNumber()).toBe(x['-'](y).toNumber())
    expect(z.toNumber()).toBe(-1)
    expect(z.getSize()).toBe(8)

    x = int(7, 4)
    y = uint(15, 4)
    z = x.sub(y)

    expect(z.toNumber()).toBe(-8)

    x = int(7, 4)

    expect(x.sub(15).toNumber()).toBe(-8)
    expect(x.sub(7).toNumber()).toBe(0)

    x = uint(7, 4)
    y = int(-3, 4)
    z = x.sub(y)

    expect(z.toNumber()).toBe(10)
})

test('Multiplication', () => {
    let x = int(3, 8)
    let y = int(2, 8)
    let z = x.mult(y)

    expect(z.toNumber()).toBe(6)

    z = x.mult(x)

    expect(z.toNumber()).toBe(9)

    x = int(-3, 8)
    y = int(2, 8)
    z = x.mult(y)

    expect(z.toNumber()).toBe(-6)

    z = x.mult(x)

    expect(z.toNumber()).toBe(9)

    z = x.mult(-3)

    expect(z.toNumber()).toBe(9)

    x = int(3, 8)
    z = x.mult(72)

    expect(z.toNumber()).toBe(-40)
    expect(z.toBinary()).toBe('11011000')

    x = int(40, 8)
    y = int(40, 13)
    z = y.mult(52)

    expect(z.toNumber()).toBe(2080)
    expect(z.toBinary()).toBe('0100000100000')

    z = x.mult(52)
    expect(z.toNumber()).toBe(32)
    expect(z.toBinary()).toBe('00100000')

    x = int(40, 8)
    y = int(52, 13)
    z = y.mult(x)

    expect(z.toNumber()).toBe(x['*'](y).toNumber())
    expect(z.toNumber()).toBe(2080)
    expect(z.toBinary()).toBe('0100000100000')
})

test('Opposite', () => {
    let x = int(3, 16)
    x = x['-']()

    expect(x.toNumber()).toBe(-3)
    expect(x.toBigInt()).toBe(-3n)
    expect(x.toBinary()).toEqual('1111111111111101')

    x = uint(3, 16)
    x = x.opposite()

    expect(x.toNumber()).toBe(65533)
    expect(x.toBigInt()).toBe(65533n)
    expect(x.toBinary()).toEqual('1111111111111101')
})

test('Division', () => {
    let x = int(3, 4)
    let y = int(1, 4)

    expect(x.div(y).toNumber()).toBe(3)
    expect(x.mod(y).toNumber()).toBe(0)

    expect(x.div(2).toNumber()).toBe(1)
    expect(x.mod(2).toNumber()).toBe(1)

    x = int(6, 4)
    y = int(-4, 4)

    expect(x.div(y).toNumber()).toBe(-1)
    expect(x.mod(y).toNumber()).toBe(2)

    expect(y.div(3).toNumber()).toBe(-1)
    expect(y.mod(3).toNumber()).toBe(-1)

    expect(y['/'](-3).toNumber()).toBe(1)
    expect(y['%'](-3).toNumber()).toBe(-1)

    x = uint(6, 4)
    y = int(-2, 4)

    expect(x.div(-2).toNumber()).toBe(0)
    expect(x.mod(-2).toNumber()).toBe(6)
    expect(x.div(y).toNumber()).toBe(0)
    expect(x.mod(y).toNumber()).toBe(6)
})

test('Shift', () => {
    let x = int(5, 8)
    let y = x.leftShift(3)
    let z = y['<<'](3)

    expect(x.toBinary()).toEqual('00000101')
    expect(y.toBinary()).toEqual('00101000')
    expect(z.toBinary()).toEqual('01000000')

    x = int(-5, 8).rightShift(72)

    expect(x.toBinary()).toEqual('00000000')

    x = int(-5, 8)
    y = x.rightShift(3)
    z = y['>>'](3)

    expect(x.toBinary()).toEqual('11111011')
    expect(y.toBinary()).toEqual('00011111')
    expect(z.toBinary()).toEqual('00000011')

    x = int(-5, 8).leftShift(72)

    expect(x.toBinary()).toEqual('00000000')
})

test('Logic', () => {
    let x = int(5, 8)
    let y = int(-431, 12)
    let z = -13

    expect(x.toBinary()).toEqual('00000101')
    expect(y.toBinary()).toEqual('111001010001')
    expect(int(z, 8).toBinary()).toEqual('11110011')
    expect(int(z, 12).toBinary()).toEqual('111111110011')

    // not
    expect(x.not().toBinary()).toEqual('11111010')
    expect(y['~']().toBinary()).toEqual('000110101110')

    // or
    expect(x.or(y).toNumber()).toBe(y.or(x).toNumber())

    expect(x.or(y).toBinary()).toEqual('111001010101')
    expect(x.or(z).toBinary()).toEqual('11110111')
    expect(y['|'](z).toBinary()).toEqual('111111110011')

    // and
    expect(x.and(y).toNumber()).toBe(y.and(x).toNumber())

    expect(x.and(y).toBinary()).toEqual('000000000001')
    expect(x.and(z).toBinary()).toEqual('00000001')
    expect(y['&'](z).toBinary()).toEqual('111001010001')

    // xor
    expect(x.xor(y).toNumber()).toBe(y.xor(x).toNumber())

    expect(x.xor(y).toBinary()).toEqual('111001010100')
    expect(x.xor(z).toBinary()).toEqual('11110110')
    expect(y['^'](z).toBinary()).toEqual('000110100010')
})

test('Comparison', () => {
    let x = int(3, 64)
    let y = int(-4, 32)
    let z = uint(5, 16)
    let a = int(5, 15)
    let b = int(-3, 4)

    expect(x.eq(y)).toBe(false)
    expect(x.eq(z)).toBe(false)
    expect(x.eq(a)).toBe(false)
    expect(y.eq(z)).toBe(false)
    expect(y.eq(a)).toBe(false)
    expect(z.eq(a)).toBe(true)
    expect(x.eq(2)).toBe(false)
    expect(x.eq(3)).toBe(true)
    expect(x.eq(4)).toBe(false)
    expect(y['=='](b)).toBe(false)

    expect(x.gt(y)).toBe(true)
    expect(x.gt(z)).toBe(false)
    expect(x.gt(a)).toBe(false)
    expect(y.gt(z)).toBe(false)
    expect(y.gt(a)).toBe(false)
    expect(z.gt(a)).toBe(false)
    expect(x.gt(2)).toBe(true)
    expect(x.gt(3)).toBe(false)
    expect(x.gt(4)).toBe(false)
    expect(y['>'](b)).toBe(false)

    expect(x.lt(y)).toBe(false)
    expect(x.lt(z)).toBe(true)
    expect(x.lt(a)).toBe(true)
    expect(y.lt(z)).toBe(true)
    expect(y.lt(a)).toBe(true)
    expect(z.lt(a)).toBe(false)
    expect(x.lt(2)).toBe(false)
    expect(x.lt(3)).toBe(false)
    expect(x.lt(4)).toBe(true)
    expect(y['<'](b)).toBe(true)

    expect(x.ge(y)).toBe(true)
    expect(x.ge(z)).toBe(false)
    expect(x.ge(a)).toBe(false)
    expect(y.ge(z)).toBe(false)
    expect(y.ge(a)).toBe(false)
    expect(z.ge(a)).toBe(true)
    expect(x.ge(2)).toBe(true)
    expect(x.ge(3)).toBe(true)
    expect(x.ge(4)).toBe(false)
    expect(y['>='](b)).toBe(false)

    expect(x.le(y)).toBe(false)
    expect(x.le(z)).toBe(true)
    expect(x.le(a)).toBe(true)
    expect(y.le(z)).toBe(true)
    expect(y.le(a)).toBe(true)
    expect(z.le(a)).toBe(true)
    expect(x.le(2)).toBe(false)
    expect(x.le(3)).toBe(true)
    expect(x.le(4)).toBe(true)
    expect(y['<='](b)).toBe(true)
})
