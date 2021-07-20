export const InternSignals = {
    REGSIGCLOCK: 'REGSIGCLOCK',
    SENDLEVELS: 'SENDLEVELS',
    SENDPULSES: 'SENDPULSES',
    SWITCH_RAMM: 'SWITCH_RAMM',
    SWITCH_REMM: 'SWITCH_REMM',
    eRAMM: 'eRAMM',
    eREMM: 'eREMM',
}

export const PulseSignals = {
    eRE: 0,
    eRA: 1,
    eRB: 2,
    eRC: 3,
    eRI: 4,
    eRX: 5,
    eM: 6,
    eCO: 7,
    eRAM: 8,
    eSP: 9,
}

export const LevelSignals = {
    REB1: 10,
    REB2: 11,
    RAB1: 12,
    RAB2: 13,
    RBB1: 14,
    RBB2: 15,
    RCB1: 16,
    RCB2: 17,
    RIB1: 18,
    RIB2: 19,
    RXB1: 20,
    RXB2: 21,
    COB1: 22,
    COB2: 23,
    sM: 24,
    SPB1: 25,
    SPB2: 26,
    XS: 27,
    XP1: 28,
    ADD: 29,
    SUB: 30,
    MUL: 31,
    AND: 32,
    OR: 33,
    XOR: 34,
    FIN: 35,
}

export default {
    ...InternSignals,
    ...PulseSignals,
    ...LevelSignals,
}
