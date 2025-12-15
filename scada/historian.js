/* UDT:ISAchieve/SCADA/Historian|v1.0.0|2024-12-15|DataSci|Data historian for SCADA|#SCADA#Historian#TimeSeries */

/**
 * SCADA Historian
 * Time-series data storage with aggregation
 * Browser-based using IndexedDB
 */

export class Historian {
  constructor(config = {}) {
    this.name = config.name || 'ISAchieve_Historian';
    this.maxSamples = config.maxSamples || 100000;
    this.aggregationIntervals = config.intervals || [60, 300, 3600, 86400]; // 1m, 5m, 1h, 1d
    this.db = null;
    this.buffer = [];
    this.bufferSize = config.bufferSize || 100;
    this.flushInterval = config.flushInterval || 5000;

    // In-memory cache for recent data
    this.cache = new Map();
    this.cacheLimit = config.cacheLimit || 1000;

    this._init();
  }

  // Initialize IndexedDB
  async _init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this._startFlushTimer();
        resolve(this);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Raw samples store
        if (!db.objectStoreNames.contains('samples')) {
          const store = db.createObjectStore('samples', { autoIncrement: true });
          store.createIndex('tag', 'tag', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('tag_time', ['tag', 'timestamp'], { unique: false });
        }

        // Aggregates store
        if (!db.objectStoreNames.contains('aggregates')) {
          const aggStore = db.createObjectStore('aggregates', { keyPath: ['tag', 'interval', 'bucket'] });
          aggStore.createIndex('tag_interval', ['tag', 'interval'], { unique: false });
        }
      };
    });
  }

  // Start flush timer
  _startFlushTimer() {
    setInterval(() => this.flush(), this.flushInterval);
  }

  // Store a sample
  async store(tag, value, timestamp = Date.now(), quality = 192) {
    const sample = { tag, value, timestamp, quality };

    // Add to buffer
    this.buffer.push(sample);

    // Add to cache
    if (!this.cache.has(tag)) {
      this.cache.set(tag, []);
    }
    const tagCache = this.cache.get(tag);
    tagCache.push(sample);
    if (tagCache.length > this.cacheLimit) {
      tagCache.shift();
    }

    // Flush if buffer full
    if (this.buffer.length >= this.bufferSize) {
      await this.flush();
    }

    return sample;
  }

  // Flush buffer to database
  async flush() {
    if (this.buffer.length === 0 || !this.db) return;

    const samples = [...this.buffer];
    this.buffer = [];

    const tx = this.db.transaction('samples', 'readwrite');
    const store = tx.objectStore('samples');

    for (const sample of samples) {
      store.add(sample);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(samples.length);
      tx.onerror = () => reject(tx.error);
    });
  }

  // Query samples
  async query(tag, startTime, endTime = Date.now(), options = {}) {
    // Check cache first for recent data
    if (this.cache.has(tag)) {
      const cached = this.cache.get(tag).filter(
        s => s.timestamp >= startTime && s.timestamp <= endTime
      );
      if (cached.length > 0 && startTime > Date.now() - 60000) {
        return cached;
      }
    }

    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('samples', 'readonly');
      const store = tx.objectStore('samples');
      const index = store.index('tag_time');

      const range = IDBKeyRange.bound(
        [tag, startTime],
        [tag, endTime]
      );

      const results = [];
      const limit = options.limit || 10000;

      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor && results.length < limit) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get latest value for tag
  async getLatest(tag) {
    // Check cache first
    if (this.cache.has(tag)) {
      const cached = this.cache.get(tag);
      if (cached.length > 0) {
        return cached[cached.length - 1];
      }
    }

    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('samples', 'readonly');
      const store = tx.objectStore('samples');
      const index = store.index('tag_time');

      const range = IDBKeyRange.bound([tag, 0], [tag, Date.now()]);
      const request = index.openCursor(range, 'prev');

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        resolve(cursor ? cursor.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Calculate aggregates
  async aggregate(tag, startTime, endTime, interval) {
    const samples = await this.query(tag, startTime, endTime);
    if (samples.length === 0) return null;

    const values = samples.map(s => s.value);
    return {
      tag,
      startTime,
      endTime,
      interval,
      count: samples.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      sum: values.reduce((a, b) => a + b, 0),
      first: samples[0].value,
      last: samples[samples.length - 1].value,
      range: Math.max(...values) - Math.min(...values),
      stddev: this._stddev(values)
    };
  }

  // Calculate standard deviation
  _stddev(values) {
    if (values.length < 2) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(v => (v - avg) ** 2);
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
  }

  // Get time-bucketed data for charts
  async getChartData(tag, startTime, endTime, buckets = 100) {
    const samples = await this.query(tag, startTime, endTime);
    if (samples.length === 0) return [];

    const bucketSize = (endTime - startTime) / buckets;
    const chartData = [];

    for (let i = 0; i < buckets; i++) {
      const bucketStart = startTime + i * bucketSize;
      const bucketEnd = bucketStart + bucketSize;
      const bucketSamples = samples.filter(
        s => s.timestamp >= bucketStart && s.timestamp < bucketEnd
      );

      if (bucketSamples.length > 0) {
        const values = bucketSamples.map(s => s.value);
        chartData.push({
          timestamp: bucketStart + bucketSize / 2,
          value: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        });
      }
    }

    return chartData;
  }

  // List all tags
  async listTags() {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('samples', 'readonly');
      const store = tx.objectStore('samples');
      const index = store.index('tag');

      const tags = new Set();
      const request = index.openKeyCursor();

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          tags.add(cursor.key);
          cursor.continue();
        } else {
          resolve(Array.from(tags));
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear old data
  async cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days default
    if (!this.db) return 0;

    const cutoff = Date.now() - maxAge;

    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('samples', 'readwrite');
      const store = tx.objectStore('samples');
      const index = store.index('timestamp');

      const range = IDBKeyRange.upperBound(cutoff);
      let deleted = 0;

      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deleted++;
          cursor.continue();
        } else {
          resolve(deleted);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Export data
  async export(tag, startTime, endTime) {
    const samples = await this.query(tag, startTime, endTime);
    return {
      tag,
      startTime,
      endTime,
      exportTime: Date.now(),
      samples
    };
  }
}

// Default instance
export const historian = new Historian();

export default Historian;
