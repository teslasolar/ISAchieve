/* UDT:ISAchieve/Core/State|v1.0.0|2024-12-15|DevOps|Global reactive state management|#Core#State#Reactive */

/**
 * Global State Management
 * Reactive state container with subscriptions and persistence
 */

export class StateManager {
  constructor(initialState = {}) {
    this._state = this._createProxy(initialState, []);
    this._subscribers = new Map();
    this._history = [];
    this._historyLimit = 50;
  }

  // Create recursive proxy for deep reactivity
  _createProxy(obj, path) {
    if (typeof obj !== 'object' || obj === null) return obj;

    return new Proxy(obj, {
      get: (target, prop) => {
        const value = target[prop];
        if (typeof value === 'object' && value !== null) {
          return this._createProxy(value, [...path, prop]);
        }
        return value;
      },
      set: (target, prop, value) => {
        const oldValue = target[prop];
        target[prop] = value;
        const fullPath = [...path, prop].join('.');
        this._notify(fullPath, value, oldValue);
        this._recordHistory(fullPath, value, oldValue);
        return true;
      }
    });
  }

  // Get state value by path
  get(path = '') {
    if (!path) return this._state;
    return path.split('.').reduce((obj, key) => obj?.[key], this._state);
  }

  // Set state value by path
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!(key in obj)) obj[key] = {};
      return obj[key];
    }, this._state);
    target[lastKey] = value;
  }

  // Subscribe to state changes
  subscribe(path, callback) {
    if (!this._subscribers.has(path)) {
      this._subscribers.set(path, new Set());
    }
    this._subscribers.get(path).add(callback);
    return () => this._subscribers.get(path)?.delete(callback);
  }

  // Notify subscribers
  _notify(path, newValue, oldValue) {
    // Exact path subscribers
    this._subscribers.get(path)?.forEach(cb => cb(newValue, oldValue, path));
    // Wildcard subscribers
    this._subscribers.get('*')?.forEach(cb => cb(newValue, oldValue, path));
    // Parent path subscribers
    const parts = path.split('.');
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.');
      this._subscribers.get(parentPath + '.*')?.forEach(cb => cb(newValue, oldValue, path));
    }
  }

  // Record state change history
  _recordHistory(path, newValue, oldValue) {
    this._history.push({
      path,
      oldValue,
      newValue,
      timestamp: Date.now()
    });
    if (this._history.length > this._historyLimit) {
      this._history.shift();
    }
  }

  // Get state change history
  getHistory(path = null) {
    if (path) return this._history.filter(h => h.path === path);
    return [...this._history];
  }

  // Batch updates
  batch(updates) {
    for (const [path, value] of Object.entries(updates)) {
      this.set(path, value);
    }
  }

  // Persist to localStorage
  persist(key = 'isachieve_state') {
    try {
      localStorage.setItem(key, JSON.stringify(this._state));
    } catch (e) {
      console.warn('State persistence failed:', e);
    }
  }

  // Restore from localStorage
  restore(key = 'isachieve_state') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const data = JSON.parse(saved);
        this._state = this._createProxy(data, []);
        return true;
      }
    } catch (e) {
      console.warn('State restore failed:', e);
    }
    return false;
  }

  // Reset to initial state
  reset(initialState = {}) {
    this._state = this._createProxy(initialState, []);
    this._history = [];
    this._notify('*', this._state, null);
  }
}

// Default state instance with ISAchieve structure
export const state = new StateManager({
  system: {
    uptime: 0,
    status: 'initializing',
    version: '1.0.0',
    mode: 'idle'
  },
  performance: {
    totalThroughput: 0,
    averageLatency: 0,
    systemEfficiency: 0,
    errorRate: 0,
    securityScore: 0
  },
  resources: {
    cpu: { total: 1000, used: 0 },
    memory: { total: 8192, used: 0 },
    network: { total: 10000, used: 0 },
    storage: { total: 50000, used: 0 },
    completedJobs: 0,
    failedJobs: 0
  },
  achievements: {
    points: 0,
    level: 0,
    unlocked: []
  },
  components: []
});

export default state;
