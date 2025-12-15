import { Component } from '../base/Component.js';
import { tagManager } from '../base/TagManager.js';

export class ScreenHeader extends Component {
    constructor(config) {
        super(config);
        this.title = config.title || 'Screen';
    }

    render() {
        const header = document.createElement('div');
        header.className = 'screen-header';
        
        // Apply tag-based styling
        tagManager.applyTags(header, this.tags);

        // Create title element
        const titleEl = document.createElement('div');
        titleEl.className = 'screen-title';
        titleEl.textContent = this.title;

        // Create tags container
        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'screen-tags';

        // Render tag badges
        this.tags.forEach(tag => {
            const tagBadge = document.createElement('span');
            tagBadge.className = 'tag';
            tagBadge.textContent = tag;
            
            // Apply tag-specific styling to badge
            const tagDef = tagManager.getTagDefinition(tag);
            if (tagDef) {
                tagBadge.setAttribute('data-tag-type', tag);
            }
            
            tagsContainer.appendChild(tagBadge);
        });

        header.appendChild(titleEl);
        header.appendChild(tagsContainer);

        return header;
    }

    updateTitle(newTitle) {
        this.title = newTitle;
        if (this.element) {
            const titleEl = this.element.querySelector('.screen-title');
            if (titleEl) {
                titleEl.textContent = newTitle;
            }
        }
    }

    addTag(tag) {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            if (this.element) {
                // Re-render tags
                this.unmount();
                this.element = this.render();
            }
        }
    }

    removeTag(tag) {
        const index = this.tags.indexOf(tag);
        if (index > -1) {
            this.tags.splice(index, 1);
            if (this.element) {
                this.unmount();
                this.element = this.render();
            }
        }
    }
}

export default ScreenHeader;
