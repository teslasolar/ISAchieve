// Logger utility for agent activities

export class Logger {
    constructor(context = 'ISAchieve') {
        this.context = context;
        this.logs = [];
    }

    info(message, data = {}) {
        this._log('INFO', message, data);
    }

    warn(message, data = {}) {
        this._log('WARN', message, data);
    }

    error(message, data = {}) {
        this._log('ERROR', message, data);
    }

    debug(message, data = {}) {
        this._log('DEBUG', message, data);
    }

    _log(level, message, data) {
        const logEntry = {
            level,
            message,
            data,
            context: this.context,
            timestamp: new Date().toISOString()
        };

        this.logs.push(logEntry);
        console.log(`[${level}] ${this.context}: ${message}`, data);
    }

    getLogs(level = null) {
        if (level) {
            return this.logs.filter(log => log.level === level);
        }
        return this.logs;
    }

    clear() {
        this.logs = [];
    }
}

export default Logger;
