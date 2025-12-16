/* UDT:ISAchieve/Index/App|v1.0.0|2024-12-16|DevOps|Main app controller|#Index#App#Controller */

/**
 * ISAchieve App Controller
 * Main entry point for the index-based app structure
 * Loads screen configs from index/*.json and manages layout
 */

export class ISAchieveApp {
  constructor() {
    this.config = null;
    this.screens = new Map();
    this.layout = 'quad';
    this.container = null;
    this.initialized = false;
  }

  // Load app manifest
  async loadConfig() {
    try {
      const res = await fetch('./index/app.json');
      this.config = await res.json();
      document.title = this.config.title || 'ISAchieve';
      return this.config;
    } catch (e) {
      console.warn('No app.json found, using defaults');
      this.config = { name: 'ISAchieve', screens: {} };
      return this.config;
    }
  }

  // Load all screen configs
  async loadScreens() {
    const screenFiles = ['center', 'north', 'east', 'south', 'west'];

    for (const name of screenFiles) {
      try {
        const res = await fetch(`./index/${name}.json`);
        if (res.ok) {
          const screen = await res.json();
          screen.position = name;
          this.screens.set(name, screen);
        }
      } catch (e) {
        console.warn(`Could not load screen: ${name}`);
      }
    }
    return this.screens;
  }

  // Create screen element
  createScreen(name, config) {
    const screen = document.createElement('div');
    screen.className = `screen screen-${name}`;
    screen.dataset.position = name;

    // Apply tags as classes
    if (config.tags) {
      config.tags.forEach(tag => screen.classList.add(`tag-${tag}`));
    }

    screen.innerHTML = `
      <div class="screen-header">
        <span class="screen-title">${config.title || name}</span>
        <div class="screen-controls">
          <button class="btn-minimize" title="Minimize">_</button>
          <button class="btn-maximize" title="Maximize">□</button>
          <button class="btn-refresh" title="Refresh">↻</button>
        </div>
      </div>
      <div class="screen-content">
        <div class="screen-loading">Loading...</div>
      </div>
    `;

    // Setup controls
    const refreshBtn = screen.querySelector('.btn-refresh');
    const maxBtn = screen.querySelector('.btn-maximize');

    refreshBtn?.addEventListener('click', () => this.refreshScreen(name));
    maxBtn?.addEventListener('click', () => this.toggleMaximize(name));

    return screen;
  }

  // Load iframe content
  loadScreenContent(screen, config) {
    const content = screen.querySelector('.screen-content');
    const loading = screen.querySelector('.screen-loading');

    // Handle disabled screens with placeholder
    if (config.enabled === false) {
      loading.textContent = config.placeholder || 'Disabled';
      loading.classList.add('placeholder');
      return;
    }

    // Handle component-based screens (no iframe)
    if (config.component) {
      loading.style.display = 'none';
      this.loadComponent(content, config.component, config);
      return;
    }

    // Handle null/empty URL
    if (!config.url) {
      loading.textContent = config.placeholder || 'No content';
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.className = 'screen-iframe';
    iframe.src = config.url;
    iframe.setAttribute('loading', 'lazy');

    iframe.onload = () => {
      loading.style.display = 'none';
    };

    iframe.onerror = () => {
      loading.textContent = `Failed: ${config.url}`;
      loading.classList.add('error');
    };

    content.appendChild(iframe);
  }

  // Load built-in component
  loadComponent(container, type, config) {
    switch (type) {
      case 'terminal':
        this.createTerminal(container);
        break;
      default:
        container.innerHTML = `<div class="screen-loading">Unknown: ${type}</div>`;
    }
  }

  // Create terminal component
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
      line.textContent = msg;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    };

    this.log('ISAchieve Console v1.0');
    this.log('Type "help" for commands');

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        input.value = '';
        if (cmd) this.exec(cmd);
      }
    });
  }

  // Execute terminal command
  exec(cmd) {
    this.log(`> ${cmd}`);
    const [command, ...args] = cmd.split(' ');

    switch (command) {
      case 'help':
        this.log('screens | layout <type> | refresh <id> | clear | ver');
        break;
      case 'screens':
        this.screens.forEach((s, id) => this.log(`  ${id}: ${s.title}`));
        break;
      case 'layout':
        args[0] ? (this.setLayout(args[0]), this.log(`Layout: ${args[0]}`)) : this.log(`Layout: ${this.layout}`);
        break;
      case 'refresh':
        args[0] && (this.refreshScreen(args[0]), this.log(`Refreshed ${args[0]}`));
        break;
      case 'clear':
        document.querySelector('#term-out').innerHTML = '';
        break;
      case 'ver':
        this.log(`v${this.config?.version || '1.0.0'}`);
        break;
      default:
        this.log(`? ${command}`);
    }
  }

  // Refresh a screen
  refreshScreen(name) {
    const screen = this.container?.querySelector(`.screen-${name}`);
    const iframe = screen?.querySelector('iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }
  }

  // Toggle maximize
  toggleMaximize(name) {
    const screen = this.container?.querySelector(`.screen-${name}`);
    if (screen) {
      screen.classList.toggle('maximized');
      this.container.classList.toggle('has-maximized');
    }
  }

  // Set layout
  setLayout(layout) {
    this.layout = layout;
    if (this.container) {
      this.container.dataset.layout = layout;
    }
  }

  // Render app
  render() {
    const app = document.createElement('div');
    app.className = 'isa-app';
    app.dataset.layout = this.layout;

    // Create dock container
    const dock = document.createElement('div');
    dock.className = 'dock-container';

    // Render screens in order
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

  // Mount to DOM
  mount(target) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el && this.container) {
      el.innerHTML = '';
      el.appendChild(this.container);
    }
  }

  // Initialize app
  async init() {
    if (this.initialized) return this;

    await this.loadConfig();
    await this.loadScreens();

    this.initialized = true;
    console.log(`[ISAchieve] Loaded ${this.screens.size} screens`);

    return this;
  }

  // Quick start
  static async start(target = '#app') {
    const app = new ISAchieveApp();
    await app.init();
    app.render();
    app.mount(target);

    // Expose globally
    window.ISAchieveApp = app;

    return app;
  }
}

// Auto-init if script loaded directly
if (typeof window !== 'undefined') {
  window.ISAchieveApp = ISAchieveApp;
}

export default ISAchieveApp;
