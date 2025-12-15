<!--
================================================================================
UDT: ISAchieve/Docs/Architecture
Version: 1.0.0
Created: 2024-12-15
Author: ISAchieve-System
Modified: 2024-12-15 | ISAchieve-System | Initial architecture design
Tags: #Architecture #SCADA #ISA95 #GitHub-Pages #Self-Generating
================================================================================
-->

# ISAchieve - Self-Generating SCADA Sandbox Architecture

## Build Legend (Token-Efficient Reference)
```
SYMBOLS:
🧊=Array  🎲=Cube  🧠=LLM  ⚡=eVGPU  📡=API  🏷️=Tag
🔄=Sync   🎯=Event 🖥️=View 📊=Chart  🔧=Config

UDT HEADER FORMAT (all files):
/* UDT:{path}|v{ver}|{date}|{author}|{desc}|#{tags} */
```

## Directory Structure (GitHub Pages Optimized)

```
ISAchieve/
├── index.html                    # Entry point / loader
├── _config.yml                   # GitHub Pages config
│
├── core/                         # Core system modules
│   ├── udt.js                   # UDT header parser/validator
│   ├── tags.js                  # Tag tree system (ISA-95)
│   ├── state.js                 # Global state management
│   └── loader.js                # Dynamic module loader
│
├── compute/                      # Processing layer
│   ├── evgpu.js                 # CPU-based parallel compute
│   ├── blockarray.js            # 3D sparse array structure
│   ├── cube.js                  # 9-node cube units
│   └── femtollm.js              # Lightweight LLM processor
│
├── api/                          # REST API simulation
│   ├── router.js                # Request routing
│   ├── handlers.js              # Endpoint handlers
│   └── websocket.js             # Real-time streaming
│
├── scada/                        # SCADA components
│   ├── plc.js                   # PLC simulation
│   ├── hmi.js                   # HMI rendering
│   ├── historian.js             # Data historian
│   └── alarms.js                # Alarm management
│
├── viz/                          # Visualization
│   ├── three-world.js           # 3D world renderer
│   ├── dashboard.js             # Perspective-style views
│   ├── charts.js                # Real-time charts
│   └── components.js            # UI components
│
├── standards/                    # ISA compliance
│   ├── isa95.js                 # Enterprise integration
│   ├── isa88.js                 # Batch control
│   ├── isa101.js                # HMI standards
│   └── achievements.js          # Gamified compliance
│
├── styles/                       # CSS modules
│   ├── core.css                 # Base styles
│   ├── dashboard.css            # Dashboard layouts
│   ├── scada.css                # SCADA-specific
│   └── themes/                  # Theme variants
│
├── workers/                      # Web Workers
│   ├── compute-worker.js        # Heavy computation
│   ├── data-worker.js           # Data processing
│   └── sim-worker.js            # Simulation engine
│
└── config/                       # Configuration
    ├── tags.json                # Tag definitions
    ├── components.json          # Component registry
    └── achievements.json        # Achievement definitions
```

## UDT Header Standard

Every file MUST include a UDT header as the first comment:

### JavaScript Files
```javascript
/* UDT:ISAchieve/Core/Tags|v1.0.0|2024-12-15|SysAdmin|Tag tree implementation|#ISA95#Tags */
```

### CSS Files
```css
/* UDT:ISAchieve/Styles/Core|v1.0.0|2024-12-15|DevOps|Base styles|#CSS#Theme */
```

### HTML Files
```html
<!-- UDT:ISAchieve/Views/Dashboard|v1.0.0|2024-12-15|HMI|Main dashboard|#View#Perspective -->
```

### JSON Files
```json
{ "_udt": "ISAchieve/Config/Tags|v1.0.0|2024-12-15|DataSci|Tag definitions|#Config#Tags" }
```

## Tag Tree Structure (Ignition-Compatible)

```
[default]ISAchieve/
├── System/
│   ├── Status          # Overall health
│   ├── Uptime          # System uptime
│   ├── Version         # Current version
│   └── Mode            # Operating mode
│
├── BlockArray/
│   └── Grid[x][y][z]   # 3D sparse array
│
├── Cubes/
│   └── C{id}/
│       └── V{vtx}      # 9 vertices per cube
│           ├── Value
│           ├── Quality
│           └── Timestamp
│
├── eVGPU/
│   ├── Ops[]           # Operation queue
│   ├── ThreadPool      # Worker threads
│   └── Metrics/
│       ├── OpsPerSec
│       └── Utilization
│
├── SCADA/
│   ├── PLC/
│   │   └── {plcId}/
│   │       ├── Status
│   │       ├── Registers[]
│   │       └── Coils[]
│   ├── HMI/
│   │   └── Screens[]
│   └── Alarms/
│       └── Active[]
│
├── Historian/
│   ├── Samples[]
│   └── Aggregates/
│
└── Achievements/
    ├── Points
    ├── Level
    └── Unlocked[]
```

## Module Communication

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Loader    │────▶│    Tags     │────▶│   State     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   eVGPU     │◀───▶│ BlockArray  │◀───▶│    Cube     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    API      │────▶│    SCADA    │────▶│   Views     │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Self-Generation Patterns

### Component Auto-Creation
```javascript
// Components self-register and auto-configure
ISA.register('database', {
  autoBuild: true,
  rate: 0.8,
  connections: ['api', 'cache'],
  isaContribution: { 'ISA-95': 10 }
});
```

### Reactive Tag Binding
```javascript
// Tags auto-update UI when changed
ISA.tags.bind('[default]ISAchieve/System/Status',
  el => el.classList.toggle('active', ISA.tags.get().value)
);
```

### Event-Driven Growth
```javascript
// System grows based on load/achievements
ISA.on('achievement:unlocked', ({ points }) => {
  if (points > 100) ISA.autoBuild.spawnComponent();
});
```

## Build Phases

### Phase 1: Core Infrastructure
- [ ] UDT parser and validator
- [ ] Tag tree implementation
- [ ] State management
- [ ] Module loader

### Phase 2: Compute Layer
- [ ] eVGPU Web Worker pool
- [ ] BlockArray sparse 3D storage
- [ ] Cube 9-node processing units
- [ ] FemtoLLM basic inference

### Phase 3: SCADA Simulation
- [ ] PLC register simulation
- [ ] HMI screen rendering
- [ ] Historian sample storage
- [ ] Alarm state machine

### Phase 4: Visualization
- [ ] Three.js 3D world
- [ ] Dashboard framework
- [ ] Real-time charts
- [ ] Achievement overlay

### Phase 5: Self-Generation
- [ ] Auto-component spawning
- [ ] Load-based scaling
- [ ] Achievement triggers
- [ ] System evolution

## API Endpoints (Browser-Based)

```
GET  /api/status              # System status
GET  /api/tags/{path}         # Read tag value
POST /api/tags/{path}         # Write tag value
POST /api/cube/create         # Create cube
POST /api/cube/{id}/process   # Process cube vertex
GET  /api/achievements        # Get achievements
POST /api/load/generate       # Generate workload
WS   /api/stream              # Real-time updates
```

## Performance Targets

| Metric | Target | Method |
|--------|--------|--------|
| Tag read | <10ms | IndexedDB + memory cache |
| Tag write | <50ms | Batched writes |
| API response | <100ms | Service Worker |
| Cube process | <1s | Web Worker pool |
| 3D render | 60fps | RequestAnimationFrame |
| Components | 1000+ | Spatial partitioning |

## GitHub Pages Deployment

```yaml
# _config.yml
title: ISAchieve SCADA Sandbox
baseurl: /ISAchieve
plugins:
  - jekyll-sitemap
include:
  - _headers
```

```
# _headers (Netlify-style, adapt for GH Pages)
/*
  Access-Control-Allow-Origin: *
  Cache-Control: public, max-age=3600
```
