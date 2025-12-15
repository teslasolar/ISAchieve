/* UDT:ISAchieve/Core/Tags|v1.0.0|2024-12-15|SysAdmin|Ignition-style tag tree system|#Core#Tags#ISA95 */

/**
 * Tag Tree System - Ignition 8.3 Compatible
 * Hierarchical tag structure with quality, timestamp, and history
 *
 * Path format: [provider]Path/To/Tag
 * Default provider: [default]ISAchieve/
 */

export class TagTree {
  constructor(provider = 'default') {
    this.provider = provider;
    this.tags = new Map();
    this.subscriptions = new Map();
    this.history = new Map();
    this.historyLimit = 1000;
  }

  // Parse tag path: [provider]Path/To/Tag -> { provider, path }
  parsePath(fullPath) {
    const match = fullPath.match(/^\[([^\]]+)\](.+)$/);
    if (match) {
      return { provider: match[1], path: match[2] };
    }
    return { provider: this.provider, path: fullPath };
  }

  // Get full path with provider
  fullPath(path) {
    if (path.startsWith('[')) return path;
    return `[${this.provider}]${path}`;
  }

  // Read tag value(s) - blocking style like Ignition
  readBlocking(paths) {
    const results = [];
    for (const p of Array.isArray(paths) ? paths : [paths]) {
      const { path } = this.parsePath(p);
      const tag = this.tags.get(path);
      results.push(tag ? { ...tag } : { value: null, quality: 0, timestamp: 0 });
    }
    return results;
  }

  // Write tag value(s) - blocking style
  writeBlocking(paths, values) {
    const pathArr = Array.isArray(paths) ? paths : [paths];
    const valArr = Array.isArray(values) ? values : [values];

    for (let i = 0; i < pathArr.length; i++) {
      const { path } = this.parsePath(pathArr[i]);
      const tag = {
        value: valArr[i],
        quality: 192, // Good quality
        timestamp: Date.now()
      };

      // Store history
      if (!this.history.has(path)) this.history.set(path, []);
      const hist = this.history.get(path);
      hist.push({ ...tag });
      if (hist.length > this.historyLimit) hist.shift();

      // Update current value
      this.tags.set(path, tag);

      // Notify subscribers
      this._notify(path, tag);
    }
  }

  // Read single tag
  read(path) {
    return this.readBlocking([path])[0];
  }

  // Write single tag
  write(path, value) {
    this.writeBlocking([path], [value]);
  }

  // Subscribe to tag changes
  subscribe(path, callback) {
    const { path: tagPath } = this.parsePath(path);
    if (!this.subscriptions.has(tagPath)) {
      this.subscriptions.set(tagPath, new Set());
    }
    this.subscriptions.get(tagPath).add(callback);

    // Return unsubscribe function
    return () => this.subscriptions.get(tagPath)?.delete(callback);
  }

  // Notify subscribers
  _notify(path, tag) {
    const subs = this.subscriptions.get(path);
    if (subs) {
      for (const cb of subs) {
        try { cb(tag, path); } catch (e) { console.error('Tag subscription error:', e); }
      }
    }
  }

  // Get tag history
  getHistory(path, limit = 100) {
    const { path: tagPath } = this.parsePath(path);
    const hist = this.history.get(tagPath) || [];
    return hist.slice(-limit);
  }

  // List all tags under a path
  browse(basePath = '') {
    const { path: base } = this.parsePath(basePath);
    const results = [];
    for (const [path] of this.tags) {
      if (path.startsWith(base)) {
        results.push(this.fullPath(path));
      }
    }
    return results.sort();
  }

  // Create folder structure
  createFolder(path) {
    this.write(`${path}/_folder`, { type: 'folder', created: Date.now() });
  }

  // Batch operations for performance
  batch(operations) {
    const paths = [];
    const values = [];
    for (const op of operations) {
      if (op.write) {
        paths.push(op.path);
        values.push(op.value);
      }
    }
    if (paths.length) this.writeBlocking(paths, values);
  }

  // Export all tags as JSON
  export() {
    const data = {};
    for (const [path, tag] of this.tags) {
      data[path] = tag;
    }
    return data;
  }

  // Import tags from JSON
  import(data) {
    for (const [path, tag] of Object.entries(data)) {
      this.tags.set(path, tag);
    }
  }
}

// Default tag tree instance
export const tags = new TagTree();

// Initialize standard ISAchieve tag structure
export function initTagTree(tree = tags) {
  const paths = [
    'ISAchieve/System/Status',
    'ISAchieve/System/Uptime',
    'ISAchieve/System/Version',
    'ISAchieve/System/Mode',
    'ISAchieve/eVGPU/Utilization',
    'ISAchieve/eVGPU/OpsPerSec',
    'ISAchieve/Achievements/Points',
    'ISAchieve/Achievements/Level',
    'ISAchieve/SCADA/Status'
  ];

  for (const p of paths) {
    tree.write(p, 0);
  }

  tree.write('ISAchieve/System/Version', '1.0.0');
  tree.write('ISAchieve/System/Status', 'online');
  tree.write('ISAchieve/System/Mode', 'running');

  return tree;
}

export default tags;
