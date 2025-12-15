// ISAchieve - Core Module
// Achievement tracking for self-building AI agents

export class ISAchieve {
    constructor(config = {}) {
        this.agentId = config.agentId || 'default-agent';
        this.trackingEnabled = config.trackingEnabled !== false;
        this.achievements = new Map();
        this.metrics = {
            totalAchievements: 0,
            unlockTimestamps: [],
            categories: new Map()
        };
    }

    unlock(achievementId, data = {}) {
        if (!this.trackingEnabled) {
            return false;
        }

        const achievement = {
            id: achievementId,
            agentId: this.agentId,
            timestamp: data.timestamp || Date.now(),
            metadata: data.metadata || {},
            description: data.description || ''
        };

        this.achievements.set(achievementId, achievement);
        this.metrics.totalAchievements++;
        this.metrics.unlockTimestamps.push(achievement.timestamp);

        console.log(`🎯 Achievement unlocked: ${achievementId}`);
        return true;
    }

    getAchievement(achievementId) {
        return this.achievements.get(achievementId);
    }

    getAllAchievements() {
        return Array.from(this.achievements.values());
    }

    getMetrics() {
        return {
            ...this.metrics,
            agentId: this.agentId,
            trackingEnabled: this.trackingEnabled
        };
    }

    reset() {
        this.achievements.clear();
        this.metrics = {
            totalAchievements: 0,
            unlockTimestamps: [],
            categories: new Map()
        };
    }
}

export default ISAchieve;
