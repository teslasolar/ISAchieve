// Tag Manager - Handles tag-based behavior and styling
export class TagManager {
    constructor() {
        this.tagDefinitions = new Map();
        this.initializeDefaultTags();
    }

    initializeDefaultTags() {
        // Visual tags
        this.defineTag('primary', {
            styles: {
                border: '3px solid #667eea',
                boxShadow: '0 0 30px rgba(102, 126, 234, 0.5)'
            },
            classes: ['tag-primary']
        });

        this.defineTag('glow', {
            styles: {
                boxShadow: '0 0 40px rgba(102, 126, 234, 0.6)',
                border: '3px solid #667eea'
            },
            classes: ['tag-glow']
        });

        this.defineTag('main', {
            styles: {
                gridColumn: 'span 2'
            },
            classes: ['tag-main']
        });

        // Functional tags
        this.defineTag('interactive', {
            attributes: {
                'data-interactive': 'true'
            },
            classes: ['tag-interactive']
        });

        this.defineTag('auto-refresh', {
            behavior: {
                refresh: true,
                interval: 30000
            },
            classes: ['tag-auto-refresh']
        });

        this.defineTag('fullscreen-capable', {
            behavior: {
                fullscreen: true
            },
            classes: ['tag-fullscreen']
        });

        // Content type tags
        this.defineTag('visualization', {
            styles: {
                background: '#000000'
            },
            classes: ['tag-visualization']
        });

        this.defineTag('docs', {
            styles: {
                background: '#ffffff'
            },
            classes: ['tag-docs']
        });

        this.defineTag('metrics', {
            behavior: {
                refresh: true,
                interval: 10000
            },
            classes: ['tag-metrics']
        });

        this.defineTag('live', {
            behavior: {
                refresh: true,
                interval: 5000
            },
            classes: ['tag-live', 'tag-pulsing']
        });

        // Layout tags
        this.defineTag('center', {
            styles: {
                gridArea: 'center'
            },
            classes: ['tag-center']
        });

        this.defineTag('north', {
            styles: {
                gridArea: 'north'
            },
            classes: ['tag-north']
        });

        this.defineTag('south', {
            styles: {
                gridArea: 'south'
            },
            classes: ['tag-south']
        });

        this.defineTag('east', {
            styles: {
                gridArea: 'east'
            },
            classes: ['tag-east']
        });

        this.defineTag('west', {
            styles: {
                gridArea: 'west'
            },
            classes: ['tag-west']
        });
    }

    defineTag(name, definition) {
        this.tagDefinitions.set(name, {
            name,
            styles: definition.styles || {},
            classes: definition.classes || [],
            attributes: definition.attributes || {},
            behavior: definition.behavior || {}
        });
    }

    getTagDefinition(name) {
        return this.tagDefinitions.get(name);
    }

    applyTags(element, tags) {
        if (!Array.isArray(tags)) return;

        tags.forEach(tagName => {
            const definition = this.getTagDefinition(tagName);
            if (!definition) return;

            // Apply styles
            Object.assign(element.style, definition.styles);

            // Apply classes
            definition.classes.forEach(cls => element.classList.add(cls));

            // Apply attributes
            Object.entries(definition.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        });
    }

    getTagBehaviors(tags) {
        if (!Array.isArray(tags)) return {};

        const behaviors = {};
        tags.forEach(tagName => {
            const definition = this.getTagDefinition(tagName);
            if (definition && definition.behavior) {
                Object.assign(behaviors, definition.behavior);
            }
        });
        return behaviors;
    }

    hasTag(tags, tagName) {
        return Array.isArray(tags) && tags.includes(tagName);
    }
}

export const tagManager = new TagManager();
export default tagManager;
