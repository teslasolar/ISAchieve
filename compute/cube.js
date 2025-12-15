/* UDT:ISAchieve/Compute/Cube|v1.0.0|2024-12-15|AI-ML|9-node cube processing unit|#Compute#Cube#LLM */

/**
 * Cube - 9-Node Processing Unit
 * Based on Ignition KONOMI pattern
 * 8 corner vertices + 1 center node
 */

// Vertex names for 9-node cube
export const VERTICES = [
  'NEU', // North-East-Up
  'NED', // North-East-Down
  'NWU', // North-West-Up
  'NWD', // North-West-Down
  'SEU', // South-East-Up
  'SED', // South-East-Down
  'SWU', // South-West-Up
  'SWD', // South-West-Down
  'CTR'  // Center
];

// Vertex positions in normalized space
export const VERTEX_POSITIONS = {
  NEU: [1, 1, 1],
  NED: [1, 1, -1],
  NWU: [-1, 1, 1],
  NWD: [-1, 1, -1],
  SEU: [1, -1, 1],
  SED: [1, -1, -1],
  SWU: [-1, -1, 1],
  SWD: [-1, -1, -1],
  CTR: [0, 0, 0]
};

export class Cube {
  constructor(id, config = {}) {
    this.id = id;
    this.vertices = new Map();
    this.processing = new Map();
    this.connections = [];
    this.metadata = {
      created: Date.now(),
      lastProcessed: null,
      processCount: 0,
      owner: config.owner || null
    };

    // Initialize vertices
    for (const v of VERTICES) {
      this.vertices.set(v, {
        value: config.defaultValue ?? 0,
        quality: 192, // Good
        timestamp: Date.now(),
        processing: false
      });
    }
  }

  // Get vertex data
  getVertex(vertex) {
    return this.vertices.get(vertex);
  }

  // Set vertex value
  setVertex(vertex, value) {
    const v = this.vertices.get(vertex);
    if (v) {
      v.value = value;
      v.timestamp = Date.now();
      v.quality = 192;
    }
    return v;
  }

  // Process vertex with function
  async processVertex(vertex, processFn) {
    const v = this.vertices.get(vertex);
    if (!v || v.processing) return null;

    v.processing = true;
    this.processing.set(vertex, Date.now());

    try {
      const result = await processFn(v.value, vertex, this);
      v.value = result;
      v.timestamp = Date.now();
      v.quality = 192;
      this.metadata.lastProcessed = Date.now();
      this.metadata.processCount++;
      return result;
    } catch (err) {
      v.quality = 0; // Bad quality
      throw err;
    } finally {
      v.processing = false;
      this.processing.delete(vertex);
    }
  }

  // Process all vertices
  async processAll(processFn) {
    const results = {};
    for (const v of VERTICES) {
      results[v] = await this.processVertex(v, processFn);
    }
    return results;
  }

  // Get all vertex values as array
  toArray() {
    return VERTICES.map(v => this.vertices.get(v).value);
  }

  // Get center value (average of all or CTR)
  getCenter() {
    return this.vertices.get('CTR').value;
  }

  // Calculate center from corner average
  calculateCenter() {
    const corners = VERTICES.filter(v => v !== 'CTR');
    const sum = corners.reduce((s, v) => s + this.vertices.get(v).value, 0);
    const avg = sum / corners.length;
    this.setVertex('CTR', avg);
    return avg;
  }

  // Get face (4 vertices)
  getFace(face) {
    const faces = {
      top: ['NEU', 'NWU', 'SEU', 'SWU'],
      bottom: ['NED', 'NWD', 'SED', 'SWD'],
      north: ['NEU', 'NED', 'NWU', 'NWD'],
      south: ['SEU', 'SED', 'SWU', 'SWD'],
      east: ['NEU', 'NED', 'SEU', 'SED'],
      west: ['NWU', 'NWD', 'SWU', 'SWD']
    };
    return faces[face]?.map(v => ({
      vertex: v,
      ...this.vertices.get(v)
    }));
  }

  // Connect to another cube
  connect(otherCube, mapping = {}) {
    this.connections.push({
      cubeId: otherCube.id,
      cube: otherCube,
      mapping,
      created: Date.now()
    });
  }

  // Propagate values to connected cubes
  propagate(mapping = null) {
    for (const conn of this.connections) {
      const m = mapping || conn.mapping;
      for (const [srcV, dstV] of Object.entries(m)) {
        const value = this.vertices.get(srcV)?.value;
        if (value !== undefined) {
          conn.cube.setVertex(dstV, value);
        }
      }
    }
  }

  // Export cube state
  export() {
    const vertices = {};
    for (const [k, v] of this.vertices) {
      vertices[k] = { ...v };
    }
    return {
      id: this.id,
      vertices,
      metadata: { ...this.metadata },
      connections: this.connections.map(c => ({
        cubeId: c.cubeId,
        mapping: c.mapping
      }))
    };
  }

  // Import cube state
  import(data) {
    for (const [k, v] of Object.entries(data.vertices || {})) {
      if (this.vertices.has(k)) {
        Object.assign(this.vertices.get(k), v);
      }
    }
    Object.assign(this.metadata, data.metadata || {});
  }
}

// Cube Manager - handles multiple cubes
export class CubeManager {
  constructor() {
    this.cubes = new Map();
    this.counter = 0;
  }

  // Create new cube
  create(config = {}) {
    const id = config.id || `cube_${++this.counter}`;
    const cube = new Cube(id, config);
    this.cubes.set(id, cube);
    return cube;
  }

  // Get cube by ID
  get(id) {
    return this.cubes.get(id);
  }

  // Delete cube
  delete(id) {
    return this.cubes.delete(id);
  }

  // List all cubes
  list() {
    return Array.from(this.cubes.values());
  }

  // Process all cubes
  async processAll(processFn) {
    const results = {};
    for (const [id, cube] of this.cubes) {
      results[id] = await cube.processAll(processFn);
    }
    return results;
  }

  // Export all cubes
  export() {
    const cubes = {};
    for (const [id, cube] of this.cubes) {
      cubes[id] = cube.export();
    }
    return cubes;
  }

  // Get statistics
  getStats() {
    let totalVertices = 0;
    let totalProcessed = 0;
    for (const cube of this.cubes.values()) {
      totalVertices += 9;
      totalProcessed += cube.metadata.processCount;
    }
    return {
      cubeCount: this.cubes.size,
      totalVertices,
      totalProcessed
    };
  }
}

// Default manager instance
export const cubeManager = new CubeManager();

export default Cube;
