# Émulateur architecture Von Neumann

Projet stage juillet 2021 - Arnaud Virazel

## Questions

Quelle est la différence entre une Unité Arithmétique et Logique (UAL) et un Opérateur Combinatoire (OC) ?

## Conception

Nous partons sur un pattern MVC, la vue et le controller sont gérés dans les composants VueJS et le modèle est fait directement avec des classes JS permettant de faire tourner l'architecture sans visualisation.

## Le modèle

### Principe d'horloge

 - On note UTA l'unité de temps de l'application
 - Chaque objet à une méthode update qui prend en paramètre le temps écoulé depuis la dernière update
 - On définit le temps d'un tick d'horloge (1000 UTA par exemple)
 - On peut mettre pause ou lancer un certain nombre de UTA (+ 1000, + 200, +n...)
 - Un manager global gère les update (toutes les 1 UTA par exemple) lorsque le temps n'est pas en pause et l'envoie à tous les objets
 - Les objets qui veulent connaître et gérer le temps doivent s'enregistrer dans le manager avec une méthode

```js
class MaClasse {
    constructor() {
        Horloge.register(this.maMethodeUpdate)
    }
    
    /**
     * UTA représente le temps écoulé depuis la dernière update
     */
    maMethodeUpdate(UTA) {
        // ...
    }
}
```

### Signaux

 - Les signaux sont donnés à un instant T et doivent durer un temps D.
 - Ils sont représentés par une énumération.
 - Le temps restant pour un signal actif est donné dans un deuxième paramètre de la méthode d'update
 - Si cette valeur est 0, il reste 0 UTA et le signal est donc down
 - Sinon il est up et les composants peuvent gérer en conséquence
 - Pour envoyer un signal, il faut l'émettre de n'importe où

```js
class MaClasseReceptrice {
    constructor() {
        Horloge.register(this.maMethodeUpdate)
    }
    
    /**
     * UTA représente le temps écoulé depuis la dernière update
     *
     * signals représente le tableau des signaux. Les clés sont les 
     * valeurs de l'énumération Signals. Les valeurs sont les temps
     * restant en UTA pour ces signaux. 0 signifie que le signal
     * est inactif
     */
    maMethodeUpdate(UTA, signals) {
        if (signals[Signals.eSIG]) {
            // ... Faire quelque chose si le signal eSIG est actif
        }
    }
}

MaClasseEmetrice {
    maMethodeEmetrice() {
        SignalManager.emit(Signals.eSIG, 100)
    }
}
```

### Bus

 - Les bus représentent une valeur mais ne connaissent rien d'autre
 - Ils ont du courant ou non, dès que quelqu'un leur donne une valeur, on considère que le courant passe
 - Si aucune valeur n'a été donné durant un certain nombre de UTA alors le courant s'éteint et aucune valeur n'est à la sortie du bus.
 - Ce temps de latence permet de simuler le temps que l'électricité passe dans les fils mais permet surtout d'éviter de devoir dire au bus qu'on ne lui donne plus de valeur. La valeur doit être donné à chaque update.

```js
class Bus {
    int valeur
    int tempsDepuisModification
    bool courant
    
    setValeur(val) {
        valeur = val
        tempsDepuisModification = 0
        courant = true
    }
    
    update(UTA) {
        tempsDepuisModification += UTA
        if (tempsDepuisModification > TEMPS_MAX) {
            courant = false
            valeur = 0
        }
    }
}
```

### Isolateur

 - Un bus de sortie
 - Un signal
 - Une valeur
 - Lorsque le signal est actif, la valeur est envoyé dans le bus de sortie

```js
class Isolateur {
    Bus sortie
    int valeur
    int signal
    
    update(UTA, signals) {
        if (signals[signal]) {
            sortie.setValeur(valeur)
        }
    }
}
```

### Registre
 
 - Un registre possède une valeur T et une valeur T + 1
 - Lorsqu'un signal de tick d'horloge est émis, le registre sait qu'il doit passer sa valeur T + 1 à T, les deux rangées de transistors sont alors connectés durant el temps du signal
 - Ce tick d'horloge peut être différent selon les registres (le RAMM et REMM du séquenceur n'ont pas les mêmes cycles de vie par exemple), donc nous le modélisons par un signal.
 - Il connait son bus d'entrée (la valeur T + 1 vaut la valeur du bus d'entrée, si ce dernier est actif)
 - Il connait ses bus de sortie et ils peuvent avoir ou ne pas avoir d'Isolateur
 - S'ils n'en ont pas, la valeur du bus de sortie vaut la valeur du temps T.

```js
class Registre {
    int signalTickHorloge
    Bus/int [] entrees // Tableau de bus en entrées, si le courant passe dans l'un d'eux alors la valeur est donné à T + 1 si le signal d'écriture est actif
    Bus/Isolateur [] sorties // Tableau de bus de sorties, on peut donner un isolateur à chaque bus (représentable par un objet par exemple avec une clé bus et une clé isolateur) 
    
    int T
    int TP1
    
    update(UTA, signals) {
        // Si nouveau tick d'horloge
        if (signals[signalTickHorloge]) {
            T = TP1
        }
        
        for (entree of entrees) {
            if (entree.bus.possedeCourant() && (entree.signal == null || signals[entree.signal])) {
                TP1 = entree.bus.valeur
            }
        }
        
        for (sortie of sorties) {
            if (sortie.isolateur == null) {
                sortie.bus.setValeur(T)
            }
            else {
                sortie.isolateur.setValeur(T)
            }
        }
    }
}
```

### Mémoire

 - Un tableau d'adresse et de valeur
 - Un signal de sortie mémoire
 - Un signal d'entrée mémoire
 - Un bus d'entrée mémoire RE
 - un bus d'entrée mémoire RAM
 - Un bus de sortie mémoire RE
 - Le signal de sortie envoie les valeur dans le bus de sortie en récupérant les valeurs du bus d'entrée RAM
 - Le signal d'entrée va écrire à l'adresse du bus RAM le contenu de RE

```js
class Memoire {
    int [] memoire
    int signalEntree
    int signalSortie
    Bus entreeRAM
    Bus entreeRE
    Bus sortieRE
    
    update(UTA, signals) {
        if (signals[signalEntree]) {
            memoire[bus.entreeRAM] = bus.entreeRE
        }
        
        if (signals[signalSortie]) {
            bus.sortieRE.setValeur(memoire[bus.entreeRAM])
        }
    }
}
```

### Opérateur combinatoire

 - Deux bus d'entrée X et Y
 - Un bus de sortie
 - Un tableau de callbacks indexés par des signaux
 - L'avantage des callbacks c'est qu'elles permettent d'envoyer les signaux voulu et pourront être changés n'importe quand !

```js
class OperateurCombinatoire {
    Callback [] operations
    Bus entreeX
    Bus entreeY
    Bus sortie
    
    update (UTA, signals) {
        for ((signal, operation) of operations) {
            if (signals[signal]) {
                sortie.setValeur(operations(entreeX.valeur, entreeY.valeur))
            }
        }
    }
    
    addOperation(signal, callback(int, int) : int) {
        operations[signal] = callback
    }
}
```

### Multiplexeur

 - Contient plusieurs bus d'entrée
 - Un bus de sortie
 - Un bus de valeur
 - Lorsque le bus de valeur envoie une valeur possible pour une entrée, le bus de sortie vaut le bus d'entrée ayant la valeur en question

```js
class Multiplexeur {
    Bus [] entrees
    Bus sortie
    Bus valeur
    
    update() {
        sortie.setValeur(entrees[valeur.valeur].valeur)
    }
}
```

### Plus1

 - Modificateur de bus qui ajoute + 1 à sa valeur

```js
class Plus1 {
    Bus entree
    Bus sortie
    
    update() {
        sortie.setValeur(entre.valeur + 1)
    }
}
```

### Mémoire microprogrammée

 - On peut la voir comme une mémoire de base mais sans eM, du coup il peut y avoir une classe parent and voilà
 - eREMM est considéré comme sM pour la mémoire centrale

### RAMM

 - C'est un registre normal mais attention, le signal de changement T <- T + 1 ne dois pas être le même que les autres. Il doit être déclenché juste après que le eRAMM est terminé (signal d'écriture)

### REMM

 - Registre un peu spécial puisqu'il doit envoyer des signaux spécifiques en fonction du mot et de l'horloge

```js
class REMM extends Registre {
    int valeur
    int signalEnvoiNiveaux
    int tempsUTANiveaux
    int signalEnvoiImpulsions
    int tempsUTAImpulsions
    Bus busAdresseSuiv
    Bus busSelMS
    Bus busCond
    
    update(UTA, signals) {
        adresseSuiv = ... // Bits 1-10
        selMS = ...       // Bits 11-12
        cond = ...        // Bits 13-16
        busAdresseSuiv.setValeur(adresseSuiv)
        busSelMS.setValeur(selMS)
        busCond.setValeur(cond) // on doit d'abord vérifier si la condition est bonne ou pas (voir registre de flag), ce bus est relié au multiplexeur de condition
        
        if (signals[signalEnvoiNiveaux]) {
            SignalManager.emit([...], tempsUTANiveaux) // Les signaux de sortie
        }
        if (signals[signalEnvoiImpulsions]) {
            SignalManager.emit([...], tempsUTAImpulsions) // Les signaux d'écriture
        }
    }
}
```

### Compteur de phases

 - Le signal de FIN le remet à 0 (afficher 1)
 - Sinon à chaque boucle, il est incrémenté de 1
 - Le fait d'être à 0 envoi 1 dans le bus de valeur du multiplexeur du fetch
 - Le fait d'être à autre chose renvoie 0
 - On peut définir un maximum de 32 phases

```js
class CompteurPhases {
    int signalFin
    int phaseActuelle
    
    update(UTA, signals) {
        if (signals[signalFin]) {
            phaseActuelle = 1
        }
        // Voir comment faire pour incrémenter les phases lorsque ce n'est pas la fin
    }
}
```

### Valeur du fetch

 - Petit registre qui n'a qu'une seule sortie et qui renvoie toujours la valeur du fetch

### Registre de flag

 - Normalement, il y a une instruction qui passe par l'OC en comparant la valeur de B à 0 par exemple, mais pour l'implémentation, cette fonction est trop complexe alors qu'elle n'est pas utilisée
 - Le registre devra donc posséder des conditions et être update en fonction, comme s'il connaissait toute l'architecture
 - Pour ce faire, il utilise la même technique que l'OC à qui on donne de nouveaux signaux. Le registre de flag peut connaître de nouvelles conditions.
 - Le nombre de bits de condition doit être connu et doit être le même que celui de REMM
 - Une condition est donc affilié à un nombre. Si un nombre n'a aucune condition affilié, son bit sera toujours à 0

```js
class RegistreFlag {
    int/Callback [] conditions
    
    constructor() {
        for (int i = 0; i < 2^n; ++i) {
            conditions.push(() => {
                return 0
            })
        }
    }
    
    setCondition(valeurCondition, callback) {
        conditions[valeurCondition] = callback
    }
    
    getCondValue(valeurCondition) {
        return conditions[valeurCondition]()
    }
}
```

### Séquenceur

 - Mémoire de microprogrammation
 - Registre REMM
 - Registre RAMM
 - 3 multiplexeurs + 1 multiplexeurs à 2^n entrées pour le registre de flag
 - Plus1
 - Compteur de phases
 - Les bus qui relient

### Registre instruction

 - Registre spéciale dont seule modification est que la sortie est différentes selon le bus
 - Le bus du séquenceur renvoie COP/MA tandis que le bus du formatteur renvoie RA
 - La sortie RA peut être override via une méthode getValeur qui renverrai la valeur du séquenceur
 - L'autre bus serait géré différemment et non considéré comme un bus de sortie

```js
class RegistreInstruction extends Registre {
    Bus busSequenceur
    
    update() {
        parent.update()
        busSequenceur.setValeur(COPMA)
    }
    
    getValeur() {
        return RA
    }
}
```

### Unité de traitement

 - On peut considérer l'unité de traitement comme un packetage contenant :
 - Tous les registres (+ RI)
 - Tous les bus (hors séquenceur)
 - Le séquenceur
 - L'opérateur combinatoire
 - La mémoire centrale

### Exemple boucle d'instruction

```js
class ArchitectureVonNeumann {
    phase() {
        eRAMM()
        eREMM()
        impulsions()
    }
    
    eRAMM() {
        SignalManager.emit(Signal.eRAMM, 10)
        Horloge.waitAndTick(15, 1)
        SignalManager.emit(Signal.basculeRAMM, 10)
        Horloge.waitAndTick(15, 1)
    }
    
    eREMM() {
        SignalManager.emit(Signal.eREMM, 10)
        Horloge.waitAndTick(15, 1)
        SignalManager.emit(Signal.basculeREMM, 10)
        Horloge.waitAndTick(15, 1)
    }
    
    impulsions() {
        SignalManager.emit(Signal.sendLevels, 1)
        Horloge.waitAndTick(180, 1)
        SignalManager.emit(Signal.sendImpulsions, 1)
        Horloge.waitAndTick(15, 1)
        SignalManager.emit(Signal.endPhase, 10)
        Horloge.waitAndTick(15, 1)
    }
}
```

### Horloge et SignalManager

```js
class Horloge {
    static Callback [] registeredObjects
    static int totalUTA
    static int prevUTA
    
    static register(callback) {
        registeredObjects.push(callback)
    }
    
    static tick() {
        diffUTA = totalUTA - prevUTA
        prevUTA = totalUTA
        signals = SignalManager.getArraySignals()
        for (callback of registeredObjects) {
            callback(prevUTA, signals)
        }
    }
    
    static wait (UTA) {
        totalUTA += UTA
    }
    
    static waitAndTick(UTA, tickDiff) {
        while (UTA > tickDiff) {
            UTA -= tickDiff
            wait(tickDiff)
            tick()
        }
        wait(UTA)
        tick()
    }
}
```

```js
class SignalManager {
    static int/int [] signals
    
    static init() {
        for (signal in signals) {
            signals[signal] = 0
        }
        Horloge.register(update)
    }
    
    static update(UTA) {
        for (signal in signals) {
            signals[signal] = min(signals[signal] - UTA, 0)
        }
    }
    
    static getArraySignals() {
        return signals
    }
    
    static emit(signal, UTA) {
        signals[signal] = max(UTA, signals[signal])
    }
    
    static emit(signalsArray [], UTA) {
        for (signal of signalsArray) {
            signals[signal] = min(signals[signal] - UTA, 0)
        }
    }
}
```

### Architecture

```js
Bus busA = new Bus()
Bus busB = new Bus()
Bus busC = new Bus()

Bus entreeRAM = new Bus()
Bus entreeRE = new Bus()
Bus sortieRE = new Bus()

Registre registreA = new Registre(
    [busC],
    [new Isolateur(Signal.RAB1, busA), new Isolateur(Signal.RAB2, busB)],
    Signal.endPhase
)
Registre registreB = new Registre(
    [busC],
    [new Isolateur(Signal.RBB1, busA), new Isolateur(Signal.RBB2, busB)],
    Signal.endPhase
)

// ...

Memoire memoire = new Memoire(
    Signal.eM,
    Signal.sM,
    entreeRAM,
    entreeRE,
    sortieRE
)
OperateurCombinatoire OC = new OperateurCombinatoire(
    busA,
    busB,
    busC
)
OC.addOperation(XS, function(x, y) { return x; }

// ...

Multiplexeur cond = new Multiplexeur(
    {0: busP1, 1: busAdrSuiv}
    busSortieCond,
    busvaleurCond
)

// ...

Plus1 P1 = new Plus1(busSortieRamm, busP1)

REMM remm = new REMM(
    Signal.basculeREMM,
    Signal.eREMM,
    busAdrSuiv,
    busSelMS,
    busCond,
    10,
    170
)

// ...
```
