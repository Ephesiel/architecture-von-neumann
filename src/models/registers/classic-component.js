import RegisterDecorator from '@/models/registers/register-decorator'
import { Signals } from '@/globals'

/**
 * Composant du décorateur qui ajoute le signal par défaut qu'utilisent les
 * registres dans l'unité centrale de traitement.
 *
 * Tous les registres de l'unité centrale de traitement utilisent le même
 * signal pour passer de la valeur T à la valeur T + 1.
 *
 * Ainsi, on ne veut pas avoir à renseigner ce signal à chaque fois, ce qui est
 * aussi *error-prone*. C'est pourquoi ce composant existe.
 *
 * Pour créer un registre d'architecture avec le signal par défaut, il faudrait
 * faire ceci :
 * ```js
 * const [bus1, bus2, bus3, bus4] = [new Bus(), new Bus(), new Bus(), new Bus()]
 * const registreA = new ClassicComponent(new Register({
 *      Helper.makeRObj(signals.eSIG1, bus1),
 *      Helper.makeRObj(signals.eSIG2, bus2)
 *  }, [ bus3, bus4 ]))
 * ```
 * Il est évidemment conseillé d'utiliser des fonctions du `Helper` pour créer
 * les composants plus facilement, sans avoir recours à plusieurs `new` dans la
 * même ligne de code.
 */
export default class ClassicComponent extends RegisterDecorator {
    constructor(register) {
        super(register)

        this.register.setSignalClockTick(Signals.REGSIGCLOCK)
    }
}
