/* UDT:ISAchieve/Index/App|v1.2.0|2024-12-16|DevOps|Self-generating ERP/SCADA app|#Index#App#Agents#ERP#SCADA */

/**
 * ISAchieve App Controller - Self-Generating ERP/SCADA Edition
 * Agents dynamically create enterprise and industrial components
 */

import ERPSCADASystem from '../scada/erp.js';

// Agent definitions - each agent manages different aspects
const AGENTS = {
  SysAdmin: { color: '#ff0000', specialty: 'system', builds: ['status', 'metrics'] },
  DevOps:   { color: '#00ff00', specialty: 'api', builds: ['api', 'deploy'] },
  NetSec:   { color: '#0000ff', specialty: 'security', builds: ['auth', 'firewall'] },
  DataSci:  { color: '#ffff00', specialty: 'data', builds: ['charts', 'analytics'] },
  AIML:     { color: '#ff00ff', specialty: 'compute', builds: ['cube', 'llm'] },
  Cloud:    { color: '#00ffff', specialty: 'infra', builds: ['scale', 'deploy'] }
};

// Dynamic component registry - agents can add to this
const COMPONENTS = {
  terminal: (app, container) => app.createTerminal(container),
  status: (app, container) => app.createStatusPanel(container),
  agents: (app, container) => app.createAgentPanel(container),
  metrics: (app, container) => app.createMetricsPanel(container),
  cube: (app, container) => app.createCubeViz(container),
  // ERP/SCADA components
  erp: (app, container) => app.createERPBrowser(container),
  inventory: (app, container) => app.erp?.createComponent('erp.inventory', container),
  production: (app, container) => app.erp?.createComponent('erp.production', container),
  alarms: (app, container) => app.erp?.createComponent('scada.alarms', container),
  historian: (app, container) => app.erp?.createComponent('scada.historian', container),
  hmi: (app, container) => app.erp?.createComponent('scada.hmi', container)
};

export class ISAchieveApp {
  constructor() {
    this.config = null;
    this.screens = new Map();
    this.agents = new Map();
    this.layout = 'quad';
    this.container = null;
    this.initialized = false;
    this.generatedComponents = [];
    this.stats = { uptime: 0, generated: 0, agents: 0, erpModules: 0, scadaModules: 0 };
    this.erp = null; // ERP/SCADA system
  }

  // Initialize agents
  initAgents() {
    Object.entries(AGENTS).forEach(([name, config]) => {
      this.agents.set(name, {
        ...config,
        name,
        active: true,
        spawned: 0,
        lastAction: Date.now(),
        log: []
      });
    });
    this.stats.agents = this.agents.size;
    console.log(`[ISA] ${this.agents.size} agents initialized`);
  }

  // Agent action - spawn component
  agentSpawn(agentName, componentType, target) {
    const agent = this.agents.get(agentName);
    if (!agent) return null;

    agent.spawned++;
    agent.lastAction = Date.now();
    agent.log.push(`Spawned ${componentType}`);
    if (agent.log.length > 10) agent.log.shift();

    this.stats.generated++;
    this.generatedComponents.push({ type: componentType, agent: agentName, time: Date.now() });

    this.log?.(`[${agentName}] Spawned ${componentType}`);
    return { agent: agentName, component: componentType };
  }

  // Auto-generate screens based on what's available
  async generateScreens() {
    // Check if static configs exist, otherwise generate dynamically
    const defaultScreens = [
      { id: 'north', title: 'Status', component: 'status', tags: ['header', 'status'], priority: 1 },
      { id: 'center', title: 'Main', url: 'html/cube-linux-isa.html', tags: ['primary', 'viz'], priority: 0 },
      { id: 'east', title: 'Agents', component: 'agents', tags: ['agents', 'monitor'], priority: 2 },
      { id: 'west', title: 'Metrics', component: 'metrics', tags: ['metrics', 'data'], priority: 3 },
      { id: 'south', title: 'Console', component: 'terminal', tags: ['terminal'], priority: 4 }
    ];

    for (const screen of defaultScreens) {
      // Try to load from JSON first
      try {
        const res = await fetch(`./index/${screen.id}.json`);
        if (res.ok) {
          const config = await res.json();
          config.position = screen.id;
          this.screens.set(screen.id, config);
          continue;
        }
      } catch (e) { /* Generate instead */ }

      // Generate dynamically if no JSON
      screen.position = screen.id;
      screen.enabled = true;
      screen._generated = true;
      this.screens.set(screen.id, screen);
      this.agentSpawn('SysAdmin', screen.component || 'screen', screen.id);
    }
  }

  // Load app manifest
  async loadConfig() {
    try {
      const res = await fetch('./index/app.json');
      this.config = await res.json();
      document.title = this.config.title || 'ISAchieve';
    } catch (e) {
      this.config = { name: 'ISAchieve', version: '1.1.0', selfGen: true };
    }
    return this.config;
  }

  // Create screen element
  createScreen(name, config) {
    const screen = document.createElement('div');
    screen.className = `screen screen-${name}`;
    screen.dataset.position = name;
    if (config._generated) screen.classList.add('generated');

    config.tags?.forEach(tag => screen.classList.add(`tag-${tag}`));

    const agentColor = config._agent ? AGENTS[config._agent]?.color : null;
    const headerStyle = agentColor ? `border-left: 3px solid ${agentColor}` : '';

    screen.innerHTML = `
      <div class="screen-header" style="${headerStyle}">
        <span class="screen-title">${config.title || name}</span>
        <div class="screen-controls">
          <button class="btn-refresh" title="Refresh">↻</button>
          <button class="btn-maximize" title="Maximize">□</button>
        </div>
      </div>
      <div class="screen-content">
        <div class="screen-loading">Loading...</div>
      </div>
    `;

    screen.querySelector('.btn-refresh')?.addEventListener('click', () => this.refreshScreen(name));
    screen.querySelector('.btn-maximize')?.addEventListener('click', () => this.toggleMaximize(name));

    return screen;
  }

  // Load screen content - iframe or component
  loadScreenContent(screen, config) {
    const content = screen.querySelector('.screen-content');
    const loading = screen.querySelector('.screen-loading');

    if (config.enabled === false) {
      loading.textContent = config.placeholder || 'Disabled';
      loading.classList.add('placeholder');
      return;
    }

    // Component-based (no iframe)
    if (config.component && COMPONENTS[config.component]) {
      loading.style.display = 'none';
      COMPONENTS[config.component](this, content, config);
      return;
    }

    // URL-based (iframe)
    if (config.url) {
      const iframe = document.createElement('iframe');
      iframe.className = 'screen-iframe';
      iframe.src = config.url;
      iframe.setAttribute('loading', 'lazy');
      iframe.onload = () => loading.style.display = 'none';
      iframe.onerror = () => { loading.textContent = `Failed: ${config.url}`; loading.classList.add('error'); };
      content.appendChild(iframe);
      return;
    }

    loading.textContent = config.placeholder || 'No content';
  }

  // Built-in components
  createTerminal(container) {
    container.innerHTML = `
      <div class="terminal-wrapper">
        <div class="terminal-output" id="term-out"></div>
        <div class="terminal-input-row">
          <span class="term-prompt">isa$</span>
          <input type="text" class="term-input" id="term-in" placeholder="help">
        </div>
      </div>
    `;

    const output = container.querySelector('#term-out');
    const input = container.querySelector('#term-in');

    this.log = (msg) => {
      const line = document.createElement('div');
      line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
      if (output.children.length > 100) output.firstChild.remove();
    };

    this.log('ISAchieve Self-Gen Console v1.1');
    this.log(`${this.agents.size} agents active`);

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        input.value = '';
        if (cmd) this.exec(cmd);
      }
    });
  }

  createStatusPanel(container) {
    container.innerHTML = `<div class="status-panel" id="status-panel"></div>`;
    this.updateStatus = () => {
      const panel = container.querySelector('#status-panel');
      if (panel) {
        panel.innerHTML = `
          <div class="status-row"><span>Uptime</span><span>${this.stats.uptime}s</span></div>
          <div class="status-row"><span>Agents</span><span>${this.stats.agents}</span></div>
          <div class="status-row"><span>Generated</span><span>${this.stats.generated}</span></div>
          <div class="status-row"><span>Screens</span><span>${this.screens.size}</span></div>
          <div class="status-row"><span>ERP Modules</span><span>${this.stats.erpModules}</span></div>
          <div class="status-row"><span>SCADA Modules</span><span>${this.stats.scadaModules}</span></div>
        `;
      }
    };
    this.updateStatus();
  }

  createAgentPanel(container) {
    container.innerHTML = `<div class="agent-panel" id="agent-panel"></div>`;
    this.updateAgents = () => {
      const panel = container.querySelector('#agent-panel');
      if (panel) {
        panel.innerHTML = Array.from(this.agents.values()).map(a => `
          <div class="agent-row" style="border-left: 3px solid ${a.color}">
            <span class="agent-name">${a.name}</span>
            <span class="agent-stat">${a.spawned} spawned</span>
          </div>
        `).join('');
      }
    };
    this.updateAgents();
  }

  createMetricsPanel(container) {
    container.innerHTML = `<div class="metrics-panel" id="metrics-panel"></div>`;
    this.updateMetrics = () => {
      const panel = container.querySelector('#metrics-panel');
      if (panel) {
        const total = this.generatedComponents.length;
        const byType = {};
        this.generatedComponents.forEach(c => byType[c.type] = (byType[c.type] || 0) + 1);
        panel.innerHTML = `
          <div class="metric-row"><span>Total Components</span><span>${total}</span></div>
          ${Object.entries(byType).map(([t, c]) => `
            <div class="metric-row"><span>${t}</span><span>${c}</span></div>
          `).join('')}
        `;
      }
    };
    this.updateMetrics();
  }

  createCubeViz(container) {
    container.innerHTML = `<div class="cube-mini">🧊 Cube Viz</div>`;
  }

  // ERP/SCADA Module Browser
  createERPBrowser(container) {
    if (!this.erp) return;

    const modules = this.erp.getModuleList();
    container.innerHTML = `
      <div class="module-browser">
        <div class="module-browser-header">ERP/SCADA Modules</div>
        <div class="module-list">
          ${modules.map(mod => `
            <div class="module-item" data-module="${mod.id}">
              <span class="module-icon">${mod.icon}</span>
              <span class="module-name">${mod.name}</span>
              <span class="module-type ${mod.type}">${mod.type}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Click to spawn module
    container.querySelectorAll('.module-item').forEach(item => {
      item.addEventListener('click', () => {
        const moduleId = item.dataset.module;
        const mod = this.erp.spawn(moduleId, 'browser');
        if (mod) {
          this.log(`Spawned ${mod.name} via ${mod.agent}`);
        }
      });
    });
  }

  // Execute terminal command
  exec(cmd) {
    this.log(`> ${cmd}`);
    const [command, ...args] = cmd.split(' ');

    switch (command) {
      case 'help':
        this.log('Commands: agents | spawn | screens | layout | stats | erp | scada | clear');
        this.log('  spawn <agent> <type> - Agent spawns component');
        this.log('  erp [module] - List or spawn ERP module');
        this.log('  scada [module] - List or spawn SCADA module');
        break;
      case 'agents':
        this.agents.forEach(a => this.log(`  ${a.name}: ${a.spawned} spawned [${a.specialty}]`));
        break;
      case 'spawn':
        if (args[0] && args[1]) {
          const result = this.agentSpawn(args[0], args[1], 'dynamic');
          result ? this.log(`Spawned ${args[1]} via ${args[0]}`) : this.log(`Unknown agent: ${args[0]}`);
        } else {
          this.log('Usage: spawn <agent> <type>');
        }
        break;
      case 'erp':
        if (!this.erp) { this.log('ERP system not initialized'); break; }
        if (args[0]) {
          const mod = this.erp.spawn(`erp.${args[0]}`, 'terminal');
          mod ? this.log(`Spawned ${mod.name}`) : this.log(`Unknown module: ${args[0]}`);
        } else {
          this.log('ERP Modules:');
          this.erp.getModuleList().filter(m => m.type === 'erp').forEach(m =>
            this.log(`  ${m.id.replace('erp.', '')}: ${m.icon} ${m.name}`)
          );
        }
        break;
      case 'scada':
        if (!this.erp) { this.log('SCADA system not initialized'); break; }
        if (args[0]) {
          const mod = this.erp.spawn(`scada.${args[0]}`, 'terminal');
          mod ? this.log(`Spawned ${mod.name}`) : this.log(`Unknown module: ${args[0]}`);
        } else {
          this.log('SCADA Modules:');
          this.erp.getModuleList().filter(m => m.type === 'scada').forEach(m =>
            this.log(`  ${m.id.replace('scada.', '')}: ${m.icon} ${m.name}`)
          );
        }
        break;
      case 'screens':
        this.screens.forEach((s, id) => this.log(`  ${id}: ${s.title} ${s._generated ? '[gen]' : ''}`));
        break;
      case 'layout':
        args[0] ? (this.setLayout(args[0]), this.log(`Layout: ${args[0]}`)) : this.log(`Layout: ${this.layout}`);
        break;
      case 'stats':
        this.log(`Uptime: ${this.stats.uptime}s | Agents: ${this.stats.agents} | Generated: ${this.stats.generated}`);
        if (this.erp) {
          const mods = this.erp.getModuleList();
          this.log(`ERP: ${mods.filter(m => m.type === 'erp').length} | SCADA: ${mods.filter(m => m.type === 'scada').length}`);
        }
        break;
      case 'clear':
        document.querySelector('#term-out').innerHTML = '';
        break;
      default:
        this.log(`? ${command} (type 'help' for commands)`);
    }
  }

  refreshScreen(name) {
    const screen = this.container?.querySelector(`.screen-${name}`);
    const iframe = screen?.querySelector('iframe');
    if (iframe) iframe.src = iframe.src;
  }

  toggleMaximize(name) {
    const screen = this.container?.querySelector(`.screen-${name}`);
    if (screen) {
      screen.classList.toggle('maximized');
      this.container.classList.toggle('has-maximized');
    }
  }

  setLayout(layout) {
    this.layout = layout;
    if (this.container) this.container.dataset.layout = layout;
  }

  render() {
    const app = document.createElement('div');
    app.className = 'isa-app';
    app.dataset.layout = this.layout;

    const dock = document.createElement('div');
    dock.className = 'dock-container';

    const order = ['north', 'west', 'center', 'east', 'south'];
    for (const name of order) {
      const config = this.screens.get(name);
      if (config && config.enabled !== false) {
        const screen = this.createScreen(name, config);
        dock.appendChild(screen);
        this.loadScreenContent(screen, config);
      }
    }

    app.appendChild(dock);
    this.container = app;
    return app;
  }

  mount(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el && this.container) {
      el.innerHTML = '';
      el.appendChild(this.container);
    }
  }

  // Start update loop
  startLoop() {
    setInterval(() => {
      this.stats.uptime++;
      this.updateStatus?.();
      this.updateAgents?.();
      this.updateMetrics?.();

      // Random agent activity
      if (Math.random() > 0.9) {
        const agentNames = Array.from(this.agents.keys());
        const agent = agentNames[Math.floor(Math.random() * agentNames.length)];
        const types = ['metric', 'event', 'check', 'scan'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.agentSpawn(agent, type, 'auto');
      }
    }, 1000);
  }

  async init() {
    if (this.initialized) return this;

    this.initAgents();
    await this.loadConfig();
    await this.generateScreens();

    // Initialize ERP/SCADA system
    this.erp = new ERPSCADASystem(this);
    await this.erp.init();
    this.erp.startSimulation();

    // Count modules
    const mods = this.erp.getModuleList();
    this.stats.erpModules = mods.filter(m => m.type === 'erp').length;
    this.stats.scadaModules = mods.filter(m => m.type === 'scada').length;

    this.initialized = true;
    console.log(`[ISA] Self-Gen ERP/SCADA App initialized: ${this.screens.size} screens, ${this.agents.size} agents, ${mods.length} modules`);

    return this;
  }

  static async start(target = '#app') {
    const app = new ISAchieveApp();
    await app.init();
    app.render();
    app.mount(target);
    app.startLoop();

    window.ISA = app;
    return app;
  }
}

if (typeof window !== 'undefined') {
  window.ISAchieveApp = ISAchieveApp;
}

export default ISAchieveApp;
