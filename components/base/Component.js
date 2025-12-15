// Base Component Class
export class Component {
    constructor(config = {}) {
        this.config = config;
        this.element = null;
        this.tags = config.tags || [];
    }

    hasTag(tag) {
        return this.tags.includes(tag);
    }

    getTags() {
        return this.tags;
    }

    getTagStyles() {
        const styles = {};
        
        // Tag-based styling
        if (this.hasTag('primary')) {
            styles.border = '3px solid #667eea';
            styles.boxShadow = '0 0 30px rgba(102, 126, 234, 0.5)';
        }
        if (this.hasTag('secondary')) {
            styles.border = '2px solid #0f3460';
        }
        if (this.hasTag('highlighted')) {
            styles.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
        if (this.hasTag('dark')) {
            styles.background = '#16213e';
        }
        if (this.hasTag('light')) {
            styles.background = '#ffffff';
        }
        if (this.hasTag('glow')) {
            styles.boxShadow = '0 0 40px rgba(102, 126, 234, 0.6)';
        }
        
        return styles;
    }

    applyTagStyles(element) {
        const styles = this.getTagStyles();
        Object.assign(element.style, styles);
    }

    render() {
        throw new Error('render() must be implemented by subclass');
    }

    mount(parent) {
        if (!this.element) {
            this.element = this.render();
        }
        parent.appendChild(this.element);
        return this.element;
    }

    unmount() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

export default Component;
