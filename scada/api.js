/* UDT:ISAchieve/SCADA/API|v1.0.0|2024-12-15|DevOps|REST API WebDev simulation|#SCADA#API#REST */

/**
 * SCADA REST API - Ignition WebDev Style
 * Browser-based API simulation for GitHub Pages
 * Handles GET/POST requests via URL hash routing
 */

import { tags } from '../core/tags.js';
import { state } from '../core/state.js';
import { cubeManager } from '../compute/cube.js';
import { evgpu } from '../compute/evgpu.js';

export class SCADAApi {
  constructor() {
    this.handlers = new Map();
    this.middleware = [];
    this.requestLog = [];
    this.maxLogSize = 100;

    this._registerDefaultRoutes();
  }

  // Register route handler
  route(method, path, handler) {
    const key = `${method.toUpperCase()}:${path}`;
    this.handlers.set(key, handler);
  }

  // Add middleware
  use(fn) {
    this.middleware.push(fn);
  }

  // Process request
  async handle(method, path, body = null) {
    const start = performance.now();
    const request = {
      method: method.toUpperCase(),
      path,
      body,
      params: this._parseParams(path),
      query: this._parseQuery(path),
      timestamp: Date.now()
    };

    // Run middleware
    for (const mw of this.middleware) {
      try {
        await mw(request);
      } catch (err) {
        return this._error(400, err.message);
      }
    }

    // Find handler
    const handler = this._findHandler(request.method, request.path);
    if (!handler) {
      return this._error(404, `Route not found: ${method} ${path}`);
    }

    try {
      const result = await handler(request);
      const response = {
        success: true,
        data: result,
        duration: performance.now() - start
      };

      this._log(request, response);
      return response;
    } catch (err) {
      return this._error(500, err.message);
    }
  }

  // Find matching handler (supports path params)
  _findHandler(method, path) {
    // Exact match
    const key = `${method}:${path}`;
    if (this.handlers.has(key)) return this.handlers.get(key);

    // Pattern match with params
    for (const [route, handler] of this.handlers) {
      const [routeMethod, routePath] = route.split(':');
      if (routeMethod !== method) continue;

      const pattern = routePath.replace(/:[^/]+/g, '([^/]+)');
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(path)) return handler;
    }
    return null;
  }

  // Parse path parameters
  _parseParams(path) {
    const params = {};
    const parts = path.split('/').filter(Boolean);
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith(':')) {
        params[parts[i].slice(1)] = parts[i + 1];
      }
    }
    return params;
  }

  // Parse query string
  _parseQuery(path) {
    const query = {};
    const idx = path.indexOf('?');
    if (idx > -1) {
      const qs = path.slice(idx + 1);
      for (const pair of qs.split('&')) {
        const [key, value] = pair.split('=');
        query[decodeURIComponent(key)] = decodeURIComponent(value || '');
      }
    }
    return query;
  }

  // Error response
  _error(code, message) {
    return { success: false, error: { code, message } };
  }

  // Log request
  _log(request, response) {
    this.requestLog.push({
      ...request,
      response: { success: response.success, duration: response.duration }
    });
    if (this.requestLog.length > this.maxLogSize) {
      this.requestLog.shift();
    }
  }

  // Register default SCADA routes
  _registerDefaultRoutes() {
    // System status
    this.route('GET', '/api/status', async () => ({
      status: state.get('system.status'),
      uptime: state.get('system.uptime'),
      version: state.get('system.version'),
      mode: state.get('system.mode')
    }));

    // Read tag
    this.route('GET', '/api/tags/:path', async (req) => {
      const tagPath = req.query.path || req.params.path;
      return tags.read(tagPath);
    });

    // Write tag
    this.route('POST', '/api/tags/:path', async (req) => {
      const tagPath = req.body?.path || req.params.path;
      const value = req.body?.value;
      tags.write(tagPath, value);
      return { written: true, path: tagPath, value };
    });

    // Browse tags
    this.route('GET', '/api/tags', async (req) => ({
      tags: tags.browse(req.query.path || '')
    }));

    // Create cube
    this.route('POST', '/api/cube/create', async (req) => {
      const cube = cubeManager.create(req.body || {});
      return { created: true, id: cube.id };
    });

    // Get cube
    this.route('GET', '/api/cube/:id', async (req) => {
      const cube = cubeManager.get(req.params.id);
      if (!cube) throw new Error('Cube not found');
      return cube.export();
    });

    // Process cube vertex
    this.route('POST', '/api/cube/:id/process', async (req) => {
      const cube = cubeManager.get(req.params.id);
      if (!cube) throw new Error('Cube not found');

      const vertex = req.body?.vertex || 'CTR';
      const result = await cube.processVertex(vertex, async (v) => {
        // Default processing: increment
        return v + 1;
      });

      return { processed: true, vertex, result };
    });

    // Get all cubes
    this.route('GET', '/api/cubes', async () => ({
      cubes: cubeManager.list().map(c => ({ id: c.id, ...c.metadata })),
      stats: cubeManager.getStats()
    }));

    // eVGPU status
    this.route('GET', '/api/evgpu', async () => evgpu.getMetrics());

    // eVGPU compute
    this.route('POST', '/api/evgpu/compute', async (req) => {
      const { operation, data } = req.body || {};
      return evgpu.exec(operation, data);
    });

    // Achievements
    this.route('GET', '/api/achievements', async () => ({
      points: state.get('achievements.points'),
      level: state.get('achievements.level'),
      unlocked: state.get('achievements.unlocked')
    }));

    // Performance metrics
    this.route('GET', '/api/metrics', async () => state.get('performance'));

    // Generate workload
    this.route('POST', '/api/load/generate', async (req) => {
      const intensity = req.body?.intensity || 1;
      const ops = [];
      for (let i = 0; i < intensity * 10; i++) {
        ops.push(evgpu.process({ data: Math.random() * 1000 }));
      }
      await Promise.all(ops);
      return { generated: true, operations: ops.length };
    });

    // Request log
    this.route('GET', '/api/log', async () => ({
      requests: this.requestLog.slice(-20)
    }));
  }

  // Convenience methods
  async get(path) { return this.handle('GET', path); }
  async post(path, body) { return this.handle('POST', path, body); }
  async put(path, body) { return this.handle('PUT', path, body); }
  async delete(path) { return this.handle('DELETE', path); }
}

// WebSocket simulation for real-time updates
export class SCADAWebSocket {
  constructor() {
    this.subscribers = new Map();
    this.messageId = 0;
  }

  // Subscribe to topic
  subscribe(topic, callback) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic).add(callback);
    return () => this.subscribers.get(topic)?.delete(callback);
  }

  // Publish to topic
  publish(topic, data) {
    const message = {
      id: ++this.messageId,
      topic,
      data,
      timestamp: Date.now()
    };

    const subs = this.subscribers.get(topic);
    if (subs) {
      for (const cb of subs) {
        try { cb(message); } catch (e) { console.error('WS callback error:', e); }
      }
    }

    // Wildcard subscribers
    const wildcardSubs = this.subscribers.get('*');
    if (wildcardSubs) {
      for (const cb of wildcardSubs) {
        try { cb(message); } catch (e) { console.error('WS callback error:', e); }
      }
    }
  }

  // Start auto-publishing system metrics
  startMetricsStream(interval = 1000) {
    return setInterval(() => {
      this.publish('metrics', state.get('performance'));
      this.publish('system', state.get('system'));
    }, interval);
  }
}

// Default instances
export const api = new SCADAApi();
export const ws = new SCADAWebSocket();

export default api;
