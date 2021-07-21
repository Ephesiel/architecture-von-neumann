import { test, expect } from '@jest/globals'
import { MAX_NUMBER_OF_ARCH, NB_BITS_ARCH } from '@/globals'

test('MAX_NUMBER_OF_ARCH', () => {
    expect(MAX_NUMBER_OF_ARCH.toBigInt()).toBe(2n ** BigInt(NB_BITS_ARCH) - 1n)
})
