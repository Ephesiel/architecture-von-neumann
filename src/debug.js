export const Level = {
    LOG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRIT: 4,
}

/**
 * Utilitaire permettant de faire du debug.
 *
 * Il existe plusieurs niveaux de debug qui ne sont utilisés que pour la
 * lisibilité. Vous pouvez tout à fait en ajouter d'autre si ça vous plait.
 * Les différents niveaux prédéfinis sont :
 *  - LOG : 0
 *  - INFO : 1
 *  - WARN : 2
 *  - ERROR : 3
 *  - CRIT : 4
 *
 * Pour envoyer un message, il faut simplement faire :
 *
 * ```js
 * Debug.addMessage('Mon message', Level.LOG)
 * ```
 *
 * Pour faciliter l'utilisation de cette classe, 5 méthodes pour afficher les 5
 * types de messages ont été implémentées :
 *
 * ```js
 * Debug.log('Mon message de log')
 * Debug.info("Mon message d'info")
 * Debug.warn('Mon message de warning')
 * Debug.error("Mon message d'erreur")
 * Debug.crit('Mon message critique')
 * ```
 */
class Debug {
    messages //: Array

    constructor() {
        this.messages = []
    }

    createKeyIfNotExists(level) {
        if (!(level in this.messages)) {
            this.messages[level] = []
        }
    }

    addMessage(message, level) {
        this.createKeyIfNotExists(level)
        this.messages[level].push(message)
    }

    log(message) {
        this.addMessage(message, Level.LOG)
        console.log(message)
    }

    info(message) {
        this.addMessage(message, Level.INFO)
        console.info(message)
    }

    warn(message) {
        this.addMessage(message, Level.WARN)
        //console.warn(message)
    }

    error(message) {
        this.addMessage(message, Level.ERROR)
        console.error(message)
    }

    crit(message) {
        this.addMessage(message, Level.CRIT)
        console.error(message)
    }

    getMessages(level) {
        this.createKeyIfNotExists(level)
        return this.messages[level]
    }
}

export default new Debug()
