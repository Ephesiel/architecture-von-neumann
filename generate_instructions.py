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

def toWrite(num, cop, ma):
    return f"\t\"{cpt}\": {{\"COP\": \"{cop}\", \"MA\": \"{ma}\"}},\n"

with open('instructions.json', 'w') as outfile:
    outfile.write('{\n')
    for key, value in instructions.items():
        if len(value['regs']) > 0:
            for reg in value['regs']:
                if len(value['ma']) > 0:
                    for ma in value['ma']:
                        outfile.write(toWrite(cpt, f"{key} {reg}", ma))
                        cpt += 1
                else:
                    outfile.write(toWrite(cpt, f"{key} {reg}", ""))
                    cpt += 1
        elif len(value['ma']) > 0:
            for ma in value['ma']:
                if value['conds']:
                    for cond in conds: 
                        outfile.write(toWrite(cpt, f"{key} ({cond})", ma))
                        cpt += 1
                else:
                    outfile.write(toWrite(cpt, key, ma))
                    cpt += 1
        else:
            outfile.write(toWrite(cpt, key, ""))
            cpt += 1
    outfile.write('}')