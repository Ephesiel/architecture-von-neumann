/**
 * Classe qui regroupe des fonctions d'aide.
 *
 * Toutes les méthodes de cette classe sont ainsi statiques.
 */
export default class Helper {
    /**
     * Crée un objet bus/signal pour les registres.
     *
     * @param {Bus} bus Le bus concernée
     * @param {Signal|null} signal Le signal qui trigger le bus
     * @returns {Object} Un objet avec une ou deux clés : bus ou bus et signal.
     */
    static makeRObj(bus, signal = null) {
        if (typeof signal === 'undefined' || signal === null) {
            return {
                bus: bus,
            }
        } else {
            return {
                bus: bus,
                signal: signal,
            }
        }
    }
}
