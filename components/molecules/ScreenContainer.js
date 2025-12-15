import { Component } from '../base/Component.js';
import { tagManager } from '../base/TagManager.js';
import ScreenHeader from '../atomic/ScreenHeader.js';
import ScreenContent from '../atomic/ScreenContent.js';

export class ScreenContainer extends Component {
    constructor(config) {
        super(config);
        this.position = config.position || 'default';
        this.header = new ScreenHeader({
            title: config.title,
            tags: this.tags
        });
        this.content = new ScreenContent({
            url: config.url,
            tags: this.tags
        });
    }

    render() {
        const container = document.createElement('div');
        container.className = `screen-container ${this.position}`;
        
        // Apply tag-based styling and classes
        tagManager.applyTags(container, this.tags);

        // Mount child components
        this.header.mount(container);
        this.content.mount(container);

        // Load content after mounting
        setTimeout(() => {
            this.content.loadContent();
        }, 100);

        return container;
    }

    reload() {
        this.content.reload();
    }

    updateUrl(newUrl) {
        this.content.updateUrl(newUrl);
    }

    updateTitle(newTitle) {
        this.header.updateTitle(newTitle);
    }

    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.header.addTag(tag);
            
            // Re-apply tag styles to container
            if (this.element) {
                tagManager.applyTags(this.element, this.tags);
            }
        }
    }

    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index > -1) {
            this.tags.splice(index, 1);
            this.header.removeTag(tag);
        }
    }
}

export default ScreenContainer;
