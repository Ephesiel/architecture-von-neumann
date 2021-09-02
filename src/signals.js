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
    eCO: 6,
    eRAM: 7,
    eSP: 8,
    eM: 9,
    sM: 10,
}

export const LevelSignals = {
    REB1: 11,
    REB2: 12,
    RAB1: 13,
    RAB2: 14,
    RBB1: 15,
    RBB2: 16,
    RCB1: 17,
    RCB2: 18,
    RIB1: 19,
    RIB2: 20,
    RXB1: 21,
    RXB2: 22,
    COB1: 23,
    COB2: 24,
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
