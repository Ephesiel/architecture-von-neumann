import signals from '@/signals'
import constants from '@/constants'

function calculateMaxNumberOfArch() {
    return 2n ** constants.NB_BITS_ARCH - 1n
}

const globals = {
    ...constants,
    Signals: signals,
    MAX_NUMBER_OF_ARCH: calculateMaxNumberOfArch(),
}

module.exports = globals
