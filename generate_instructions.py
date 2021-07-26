#! /usr/bin/python3

regs  = ['A', 'B', 'C', 'X']
conds = ['A == 0', 'B == 0', 'A > 0', 'B > 0', 'A%2 == 0', 'B%2 == 0']
ma = ['Immédiat', 'Direct', 'Indirect', 'Relatif', 'Indexé', 'Immédiat Étendu', 'Direct Étendu', 'Indirect Étendu', 'Relatif Étendu', 'Indexé Étendu']

instructions = {
    'NOOP': {
        'regs': [],
        'ma': [],
        'conds': False
    },
    'LOAD': {
        'regs': regs, 
        'ma': ma,
        'conds': False
    },
    'STORE': {
        'regs': regs,
        'ma': ma[1:],
        'conds': False
    },
    'INC': {
        'regs': regs,
        'ma': [],
        'conds': False
    },
    'ADD': {
        'regs': regs[:2],
        'ma': ma,
        'conds': False
    },
    'A+B -> ': {
        'regs': regs[:3],
        'ma': [],
        'conds': False
    },
    'CALL': {
        'regs': [],
        'ma': ma[1:5] + ma[6:],
        'conds': False
    },
    'RETURN': {
        'regs': [],
        'ma': ma[1:5] + ma[6:],
        'conds': False
    },
    'JUMP': {
        'regs': [],
        'ma': ma[1:5] + ma[6:],
        'conds': False
    },
    'JUMPC': {
        'regs': [],
        'ma': ma[1:5] + ma[6:],
        'conds': True
    },
}

cpt = 0

with open('instructions.csv', 'w') as outfile:
    outfile.write('Numéro;Code Opération;Mode d\'adressage\n')
    for key, value in instructions.items():
        if len(value['regs']) > 0:
            for reg in value['regs']:
                if len(value['ma']) > 0:
                    for ma in value['ma']:
                        outfile.write(f"{cpt};{key} {reg};{ma}\n")
                        cpt += 1
                else:
                    outfile.write(f"{cpt};{key} {reg};\n")
                    cpt += 1
        elif len(value['ma']) > 0:
            for ma in value['ma']:
                if value['conds']:
                    for cond in conds: 
                        outfile.write(f"{cpt};{key} ({cond});{ma}\n")
                        cpt += 1
                else:
                    outfile.write(f"{cpt};{key};{ma}\n")
                    cpt += 1
        else:
            outfile.write(f"{cpt};{key};\n")
            cpt += 1