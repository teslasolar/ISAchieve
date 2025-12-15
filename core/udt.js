/* UDT:ISAchieve/Core/UDT|v1.0.0|2024-12-15|SysAdmin|UDT header parser and validator|#Core#UDT#Parser */

/**
 * UDT (Universal Data Type) Header System
 * Token-efficient metadata for all ISAchieve files
 *
 * Format: UDT:{path}|v{ver}|{date}|{author}|{desc}|#{tags}
 */

export const UDT = {
  // Parse UDT header from file content
  parse(content) {
    const patterns = [
      /\/\*\s*UDT:([^|]+)\|v([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|#([^\s*]+)/,  // JS/CSS
      /<!--\s*UDT:([^|]+)\|v([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|#([^\s-]+)/,   // HTML
      /"_udt":\s*"([^|]+)\|v([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|#([^"]+)"/     // JSON
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return {
          path: match[1],
          version: match[2],
          date: match[3],
          author: match[4],
          description: match[5],
          tags: match[6].split('#').filter(Boolean)
        };
      }
    }
    return null;
  },

  // Generate UDT header string
  generate(config) {
    const { path, version = '1.0.0', date, author, description, tags = [] } = config;
    const dateStr = date || new Date().toISOString().split('T')[0];
    const tagStr = tags.length ? '#' + tags.join('#') : '#Untagged';
    return `UDT:${path}|v${version}|${dateStr}|${author}|${description}|${tagStr}`;
  },

  // Wrap in appropriate comment for file type
  wrap(udt, type = 'js') {
    switch (type) {
      case 'html': return `<!-- ${udt} -->`;
      case 'json': return `"_udt": "${udt}"`;
      case 'css':
      case 'js':
      default: return `/* ${udt} */`;
    }
  },

  // Validate UDT header
  validate(udt) {
    if (!udt) return { valid: false, error: 'No UDT header found' };
    const required = ['path', 'version', 'date', 'author', 'description'];
    for (const field of required) {
      if (!udt[field]) return { valid: false, error: `Missing field: ${field}` };
    }
    return { valid: true, udt };
  },

  // Registry of all loaded modules with UDT
  registry: new Map(),

  // Register a module
  register(udt, module) {
    if (udt?.path) {
      this.registry.set(udt.path, { udt, module, loaded: Date.now() });
    }
  },

  // Get all registered modules
  list() {
    return Array.from(this.registry.entries()).map(([path, data]) => ({
      path,
      ...data.udt,
      loaded: data.loaded
    }));
  }
};

export default UDT;
