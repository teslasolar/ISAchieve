// Test suite for ISAchieve core functionality

import { ISAchieve } from '../src/index.js';

describe('ISAchieve', () => {
    let achiever;

    beforeEach(() => {
        achiever = new ISAchieve({
            agentId: 'test-agent',
            trackingEnabled: true
        });
    });

    test('should create an instance', () => {
        expect(achiever).toBeInstanceOf(ISAchieve);
        expect(achiever.agentId).toBe('test-agent');
    });

    test('should unlock an achievement', () => {
        const result = achiever.unlock('test-achievement', {
            description: 'Test achievement'
        });
        
        expect(result).toBe(true);
        expect(achiever.metrics.totalAchievements).toBe(1);
    });

    test('should retrieve an achievement', () => {
        achiever.unlock('test-achievement', {
            description: 'Test achievement'
        });
        
        const achievement = achiever.getAchievement('test-achievement');
        expect(achievement).toBeDefined();
        expect(achievement.id).toBe('test-achievement');
    });

    test('should get all achievements', () => {
        achiever.unlock('achievement-1');
        achiever.unlock('achievement-2');
        
        const all = achiever.getAllAchievements();
        expect(all).toHaveLength(2);
    });

    test('should reset achievements', () => {
        achiever.unlock('achievement-1');
        achiever.reset();
        
        expect(achiever.metrics.totalAchievements).toBe(0);
        expect(achiever.getAllAchievements()).toHaveLength(0);
    });
});
