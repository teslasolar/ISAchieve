import { Component } from '../base/Component.js';
import { tagManager } from '../base/TagManager.js';

export class ScreenContent extends Component {
    constructor(config) {
        super(config);
        this.url = config.url || '';
        this.loading = true;
        this.iframe = null;
    }

    render() {
        const content = document.createElement('div');
        content.className = 'screen-content';
        
        // Apply tag-based styling
        tagManager.applyTags(content, this.tags);

        // Create loading indicator
        const loadingEl = this.createLoadingIndicator();
        content.appendChild(loadingEl);

        return content;
    }

    createLoadingIndicator() {
        const loading = document.createElement('div');
        loading.className = 'loading';
        loading.innerHTML = `
            <div class="spinner"></div>
            <div>Loading content...</div>
        `;
        return loading;
    }

    createErrorIndicator(message) {
        const error = document.createElement('div');
        error.className = 'error-message';
        error.innerHTML = `
            ⚠️ ${message}
            <br><small>${this.url}</small>
        `;
        return error;
    }

    loadContent() {
        if (!this.element || !this.url) return;

        const behaviors = tagManager.getTagBehaviors(this.tags);
        
        // Create iframe
        this.iframe = document.createElement('iframe');
        this.iframe.className = 'screen-iframe';
        this.iframe.src = this.url;

        // Set iframe attributes based on tags
        if (behaviors.fullscreen) {
            this.iframe.setAttribute('allowfullscreen', 'true');
        }

        this.iframe.onload = () => {
            this.loading = false;
            const loadingEl = this.element.querySelector('.loading');
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }

            // Setup auto-refresh if tag specifies it
            if (behaviors.refresh && behaviors.interval) {
                this.setupAutoRefresh(behaviors.interval);
            }
        };

        this.iframe.onerror = () => {
            const loadingEl = this.element.querySelector('.loading');
            if (loadingEl) {
                loadingEl.innerHTML = '';
                loadingEl.appendChild(this.createErrorIndicator('Could not load content'));
            }
        };

        this.element.appendChild(this.iframe);
    }

    setupAutoRefresh(interval) {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(() => {
            this.reload();
        }, interval);
    }

    reload() {
        if (this.iframe) {
            this.iframe.src = this.iframe.src; // Force reload
        }
    }

    updateUrl(newUrl) {
        this.url = newUrl;
        if (this.iframe) {
            this.iframe.src = newUrl;
        }
    }

    unmount() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        super.unmount();
    }
}

export default ScreenContent;
