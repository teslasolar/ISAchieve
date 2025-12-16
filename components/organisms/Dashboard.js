import { Component } from '../base/Component.js';
import { tagManager } from '../base/TagManager.js';
import ScreenContainer from '../molecules/ScreenContainer.js';

export class Dashboard extends Component {
    constructor(config = {}) {
        super(config);
        this.screens = [];
        this.configPaths = config.configPaths || ['center', 'north', 'east', 'south', 'west'];
        this.currentLayout = config.layout || 'default';
    }

    async loadScreenConfigs() {
        const loadedScreens = [];
        
        for (const position of this.configPaths) {
            try {
                const response = await fetch(`index/${position}.json`);
                if (response.ok) {
                    const config = await response.json();
                    loadedScreens.push({
                        position,
                        ...config
                    });
                }
            } catch (error) {
                console.warn(`Could not load config for ${position}:`, error);
                // Create default config
                loadedScreens.push(this.getDefaultConfig(position));
            }
        }

        return loadedScreens;
    }

    getDefaultConfig(position) {
        const urlMap = {
            'center': 'html/cube-linux-isa.html',
            'north': 'docs/index.html',
            'east': 'docs/api/index.md',
            'south': 'docs/docs/getting-started.md',
            'west': 'docs/docs/index.md'
        };

        return {
            position,
            title: position.charAt(0).toUpperCase() + position.slice(1),
            url: urlMap[position] || 'docs/index.html',
            tags: [position, 'default'],
            enabled: true
        };
    }

    async init() {
        const configs = await this.loadScreenConfigs();
        
        this.screens = configs
            .filter(config => config.enabled !== false)
            .map(config => new ScreenContainer(config));
    }

    render() {
        const dashboard = document.createElement('div');
        dashboard.id = 'dashboard';
        dashboard.className = this.currentLayout;

        // Apply tag-based styling
        tagManager.applyTags(dashboard, this.tags);

        // Mount all screen components
        this.screens.forEach(screen => {
            screen.mount(dashboard);
        });

        return dashboard;
    }

    toggleLayout() {
        if (this.currentLayout === 'default') {
            this.currentLayout = 'grid-4x4';
        } else {
            this.currentLayout = 'default';
        }

        if (this.element) {
            this.element.className = this.currentLayout;
        }
    }

    reloadScreen(position) {
        const screen = this.screens.find(s => s.position === position);
        if (screen) {
            screen.reload();
        }
    }

    addScreen(config) {
        const screen = new ScreenContainer(config);
        this.screens.push(screen);
        
        if (this.element) {
            screen.mount(this.element);
        }
    }

    removeScreen(position) {
        const index = this.screens.findIndex(s => s.position === position);
        if (index > -1) {
            this.screens[index].unmount();
            this.screens.splice(index, 1);
        }
    }
}

export default Dashboard;
