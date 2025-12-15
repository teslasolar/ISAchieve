# Dashboard Screen Configuration

This directory contains JSON configuration files for each screen position in the dynamic dashboard.

## Configuration Files

- `center.json` - Main central screen (ISA Cube Visualization)
- `north.json` - Top screen configuration
- `east.json` - Right side screen configuration
- `south.json` - Bottom screen configuration
- `west.json` - Left side screen configuration

## Configuration Schema

Each JSON file should follow this structure:

```json
{
  "title": "Screen Title",
  "url": "path/to/content.html",
  "tags": ["tag1", "tag2", "tag3"],
  "enabled": true,
  "description": "Description of this screen",
  "refreshInterval": 0,
  "allowInteraction": true
}
```

### Fields

- **title** (string): Display name shown in the screen header
- **url** (string): Relative path to the HTML file or content to load
- **tags** (array): List of tags displayed as badges in the header
- **enabled** (boolean): Whether this screen should be displayed
- **description** (string): Optional description of the screen's purpose
- **refreshInterval** (number): Auto-refresh interval in milliseconds (0 = disabled)
- **allowInteraction** (boolean): Whether the iframe content is interactive

## Adding New Screens

1. Create a new JSON file (e.g., `center.json`)
2. Add your configuration following the schema above
3. The dashboard will auto-detect and load it on next refresh

## Dynamic Updates

To update a screen:
1. Edit the corresponding JSON file
2. Reload the dashboard
3. Changes will be reflected automatically

No need to modify the main `index.html` file!

## Examples

### Example: External Website
```json
{
  "title": "GitHub Stats",
  "url": "https://github.com/teslasolar/ISAchieve",
  "tags": ["external", "stats"],
  "enabled": true
}
```

### Example: Local HTML
```json
{
  "title": "Custom Dashboard",
  "url": "html/my-custom-view.html",
  "tags": ["custom", "local"],
  "enabled": true
}
```

### Example: Auto-Refresh
```json
{
  "title": "Live Metrics",
  "url": "metrics/live.html",
  "tags": ["live", "metrics"],
  "enabled": true,
  "refreshInterval": 30000
}
```

## Screen Positions

The grid layout uses these positions:

```
┌─────────────────────────────────┐
│            NORTH                │
├─────────┬─────────────┬─────────┤
│  WEST   │   CENTER    │  EAST   │
│         │  (Main ISA  │         │
│         │    Cube)    │         │
├─────────┴─────────────┴─────────┤
│            SOUTH                │
└─────────────────────────────────┘
```

The CENTER position is larger and highlighted, designed for the main ISA cube visualization.

Toggle between layouts using the "Toggle Grid Layout" button.
