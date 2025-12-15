// Agent utilities and helpers

export class AgentUtils {
    static generateId(prefix = 'agent') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    static validateConfig(config) {
        const required = ['agentId'];
        for (const field of required) {
            if (!config[field]) {
                throw new Error(`Missing required config field: ${field}`);
            }
        }
        return true;
    }

    static formatTimestamp(timestamp) {
        return new Date(timestamp).toISOString();
    }

    static calculateProgress(current, total) {
        if (total === 0) return 0;
        return Math.min(100, (current / total) * 100);
    }
}

export default AgentUtils;
