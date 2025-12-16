# ISAchieve Components

Component-based architecture using atomic design principles and tag-based configuration.

## Architecture

```
components/
├── base/               # Foundation classes
│   ├── Component.js    # Base component class
│   └── TagManager.js   # Tag system manager
├── atomic/             # Smallest components
│   ├── ScreenHeader.js
│   └── ScreenContent.js
├── molecules/          # Combined atomic components
│   └── ScreenContainer.js
└── organisms/          # Complex components
    └── Dashboard.js
```

## Tag-Based System

Components are configured entirely through **tags**, not hardcoded values.

### Tag Categories

#### Visual Tags
- `primary` - Primary styling with glow
- `glow` - Glowing border effect
- `main` - Larger grid area
- `highlighted` - Gradient background

#### Functional Tags
- `interactive` - User interaction enabled
- `auto-refresh` - Auto-refresh content
- `fullscreen-capable` - Can go fullscreen
- `live` - Real-time updates (5s)
- `metrics` - Metrics view (10s refresh)

#### Content Type Tags
- `visualization` - Black background for viz
- `docs` - White background for docs
- `3d` - 3D content optimization
- `api` - API documentation
- `reference` - Reference material

#### Layout Tags
- `center` - Center position
- `north` - Top position
- `east` - Right position
- `south` - Bottom position
- `west` - Left position

## Usage Examples

### Creating a Screen with Tags

```javascript
import ScreenContainer from './components/molecules/ScreenContainer.js';

const screen = new ScreenContainer({
    position: 'center',
    title: 'ISA Cube',
    url: 'html/cube-linux-isa.html',
    tags: ['center', 'visualization', '3d', 'primary', 'glow', 'interactive']
});
```

### Defining Custom Tags

```javascript
import { tagManager } from './components/base/TagManager.js';

tagManager.defineTag('custom-tag', {
    styles: {
        border: '2px solid red',
        background: '#ff0000'
    },
    classes: ['custom-class'],
    attributes: {
        'data-custom': 'value'
    },
    behavior: {
        refresh: true,
        interval: 15000
    }
});
```

### Tag Configuration (JSON)

```json
{
  "title": "My Screen",
  "url": "path/to/content.html",
  "tags": [
    "center",
    "primary",
    "glow",
    "interactive",
    "auto-refresh"
  ],
  "enabled": true
}
```

## Component Hierarchy

```
Dashboard (Organism)
  └─ ScreenContainer (Molecule)
      ├─ ScreenHeader (Atomic)
      │   └─ Tag badges
      └─ ScreenContent (Atomic)
          └─ Iframe with tag behaviors
```

## Tag Behaviors

Tags automatically apply:
- **Styles**: Visual appearance
- **Classes**: CSS classes
- **Attributes**: HTML attributes
- **Behaviors**: JavaScript functionality

Example:
```javascript
// Tag: 'live'
{
    styles: {},
    classes: ['tag-live', 'tag-pulsing'],
    behavior: {
        refresh: true,
        interval: 5000  // 5 second refresh
    }
}
```

## Adding New Components

1. Extend `Component` base class
2. Implement `render()` method
3. Use `tagManager.applyTags()` for tag support
4. Use `tagManager.getTagBehaviors()` for functionality

```javascript
import { Component } from '../base/Component.js';
import { tagManager } from '../base/TagManager.js';

export class MyComponent extends Component {
    render() {
        const el = document.createElement('div');
        tagManager.applyTags(el, this.tags);
        return el;
    }
}
```

## Benefits

✅ **No hardcoded values** - Everything is tag-driven  
✅ **Reusable components** - Use anywhere with different tags  
✅ **Easy configuration** - Just edit JSON tag arrays  
✅ **Extensible** - Add new tags without changing code  
✅ **Maintainable** - Clear separation of concerns
