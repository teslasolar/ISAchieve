/* UDT:ISAchieve/Compute/BlockArray|v1.0.0|2024-12-15|DataSci|3D sparse array for SCADA data|#Compute#BlockArray#3D */

/**
 * BlockArray - 3D Sparse Array Structure
 * Efficient storage for SCADA spatial data
 * Uses sparse representation to minimize memory
 */

export class BlockArray {
  constructor(config = {}) {
    this.dimensions = config.dimensions || [100, 100, 100];
    this.blockSize = config.blockSize || 16;
    this.defaultValue = config.defaultValue ?? 0;
    this.blocks = new Map();
    this.metadata = new Map();
    this.stats = {
      totalReads: 0,
      totalWrites: 0,
      blocksAllocated: 0,
      memoryUsed: 0
    };
  }

  // Get block key from coordinates
  _blockKey(x, y, z) {
    const bx = Math.floor(x / this.blockSize);
    const by = Math.floor(y / this.blockSize);
    const bz = Math.floor(z / this.blockSize);
    return `${bx},${by},${bz}`;
  }

  // Get local coordinates within block
  _localCoords(x, y, z) {
    return [
      x % this.blockSize,
      y % this.blockSize,
      z % this.blockSize
    ];
  }

  // Get or create block
  _getBlock(key, create = false) {
    if (!this.blocks.has(key)) {
      if (!create) return null;
      const block = new Float32Array(this.blockSize ** 3);
      block.fill(this.defaultValue);
      this.blocks.set(key, block);
      this.stats.blocksAllocated++;
      this.stats.memoryUsed += block.byteLength;
    }
    return this.blocks.get(key);
  }

  // Local index within block
  _localIndex(lx, ly, lz) {
    return lx + ly * this.blockSize + lz * this.blockSize * this.blockSize;
  }

  // Check bounds
  _inBounds(x, y, z) {
    return x >= 0 && x < this.dimensions[0] &&
           y >= 0 && y < this.dimensions[1] &&
           z >= 0 && z < this.dimensions[2];
  }

  // Get value at coordinates
  get(x, y, z) {
    this.stats.totalReads++;
    if (!this._inBounds(x, y, z)) return this.defaultValue;

    const key = this._blockKey(x, y, z);
    const block = this._getBlock(key);
    if (!block) return this.defaultValue;

    const [lx, ly, lz] = this._localCoords(x, y, z);
    return block[this._localIndex(lx, ly, lz)];
  }

  // Set value at coordinates
  set(x, y, z, value) {
    this.stats.totalWrites++;
    if (!this._inBounds(x, y, z)) return false;

    const key = this._blockKey(x, y, z);
    const block = this._getBlock(key, true);
    const [lx, ly, lz] = this._localCoords(x, y, z);
    block[this._localIndex(lx, ly, lz)] = value;
    return true;
  }

  // Batch get for efficiency
  getRange(x1, y1, z1, x2, y2, z2) {
    const result = [];
    for (let z = z1; z <= z2; z++) {
      for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
          result.push({
            x, y, z,
            value: this.get(x, y, z)
          });
        }
      }
    }
    return result;
  }

  // Batch set for efficiency
  setRange(cells) {
    for (const cell of cells) {
      this.set(cell.x, cell.y, cell.z, cell.value);
    }
  }

  // Fill region with value
  fill(x1, y1, z1, x2, y2, z2, value) {
    for (let z = z1; z <= z2; z++) {
      for (let y = y1; y <= y2; y++) {
        for (let x = x1; x <= x2; x++) {
          this.set(x, y, z, value);
        }
      }
    }
  }

  // Apply function to all non-default values
  forEach(callback) {
    for (const [key, block] of this.blocks) {
      const [bx, by, bz] = key.split(',').map(Number);
      for (let i = 0; i < block.length; i++) {
        if (block[i] !== this.defaultValue) {
          const lx = i % this.blockSize;
          const ly = Math.floor(i / this.blockSize) % this.blockSize;
          const lz = Math.floor(i / (this.blockSize * this.blockSize));
          const x = bx * this.blockSize + lx;
          const y = by * this.blockSize + ly;
          const z = bz * this.blockSize + lz;
          callback(x, y, z, block[i]);
        }
      }
    }
  }

  // Map function over all values
  map(fn) {
    const result = new BlockArray({
      dimensions: this.dimensions,
      blockSize: this.blockSize,
      defaultValue: fn(this.defaultValue)
    });

    this.forEach((x, y, z, value) => {
      result.set(x, y, z, fn(value));
    });

    return result;
  }

  // Reduce to single value
  reduce(fn, initial) {
    let acc = initial;
    this.forEach((x, y, z, value) => {
      acc = fn(acc, value, x, y, z);
    });
    return acc;
  }

  // Get metadata for cell
  getMeta(x, y, z) {
    return this.metadata.get(`${x},${y},${z}`);
  }

  // Set metadata for cell
  setMeta(x, y, z, meta) {
    this.metadata.set(`${x},${y},${z}`, meta);
  }

  // Get slice at Z level
  getSlice(z, axis = 'z') {
    const slice = [];
    const [dx, dy] = axis === 'z' ? [this.dimensions[0], this.dimensions[1]] :
                     axis === 'y' ? [this.dimensions[0], this.dimensions[2]] :
                                    [this.dimensions[1], this.dimensions[2]];

    for (let j = 0; j < dy; j++) {
      const row = [];
      for (let i = 0; i < dx; i++) {
        const coords = axis === 'z' ? [i, j, z] :
                       axis === 'y' ? [i, z, j] :
                                      [z, i, j];
        row.push(this.get(...coords));
      }
      slice.push(row);
    }
    return slice;
  }

  // Export to JSON
  export() {
    const cells = [];
    this.forEach((x, y, z, value) => {
      cells.push({ x, y, z, value });
    });
    return {
      dimensions: this.dimensions,
      blockSize: this.blockSize,
      defaultValue: this.defaultValue,
      cells
    };
  }

  // Import from JSON
  import(data) {
    this.dimensions = data.dimensions || this.dimensions;
    this.blockSize = data.blockSize || this.blockSize;
    this.defaultValue = data.defaultValue ?? this.defaultValue;
    this.blocks.clear();
    this.stats.blocksAllocated = 0;
    this.stats.memoryUsed = 0;

    if (data.cells) {
      this.setRange(data.cells);
    }
  }

  // Get statistics
  getStats() {
    return { ...this.stats, blockCount: this.blocks.size };
  }

  // Clear all data
  clear() {
    this.blocks.clear();
    this.metadata.clear();
    this.stats.blocksAllocated = 0;
    this.stats.memoryUsed = 0;
  }
}

// Factory for common configurations
export const BlockArrayFactory = {
  // Small grid for simple SCADA
  small: () => new BlockArray({ dimensions: [32, 32, 32], blockSize: 8 }),

  // Medium grid for facility
  medium: () => new BlockArray({ dimensions: [100, 100, 100], blockSize: 16 }),

  // Large grid for campus
  large: () => new BlockArray({ dimensions: [500, 500, 100], blockSize: 32 }),

  // Custom configuration
  create: (config) => new BlockArray(config)
};

export default BlockArray;
