/* UDT:ISAchieve/Compute/FemtoLLM|v1.0.0|2024-12-15|AI-ML|Lightweight 16d LLM for SCADA|#Compute#LLM#AI */

/**
 * FemtoLLM - Ultra-Lightweight Language Model
 * 16-dimensional embedding space for SCADA text processing
 * CPU-only, no GPU required
 */

export class FemtoLLM {
  constructor(config = {}) {
    this.hiddenSize = config.hiddenSize || 16;
    this.vocabSize = config.vocabSize || 256; // Basic ASCII
    this.maxLength = config.maxLength || 128;
    this.temperature = config.temperature || 0.7;

    // Initialize simple weights (normally loaded from trained model)
    this.embeddings = this._initEmbeddings();
    this.attention = this._initAttention();
    this.output = this._initOutput();

    this.stats = {
      tokensProcessed: 0,
      inferenceCount: 0,
      avgLatency: 0
    };
  }

  // Initialize random embeddings
  _initEmbeddings() {
    const emb = new Float32Array(this.vocabSize * this.hiddenSize);
    for (let i = 0; i < emb.length; i++) {
      emb[i] = (Math.random() - 0.5) * 0.1;
    }
    return emb;
  }

  // Initialize attention weights
  _initAttention() {
    const size = this.hiddenSize * this.hiddenSize;
    return {
      query: new Float32Array(size).map(() => (Math.random() - 0.5) * 0.1),
      key: new Float32Array(size).map(() => (Math.random() - 0.5) * 0.1),
      value: new Float32Array(size).map(() => (Math.random() - 0.5) * 0.1)
    };
  }

  // Initialize output projection
  _initOutput() {
    return new Float32Array(this.hiddenSize * this.vocabSize)
      .map(() => (Math.random() - 0.5) * 0.1);
  }

  // Tokenize text to character codes
  tokenize(text) {
    const tokens = [];
    for (let i = 0; i < Math.min(text.length, this.maxLength); i++) {
      tokens.push(text.charCodeAt(i) % this.vocabSize);
    }
    return tokens;
  }

  // Detokenize back to text
  detokenize(tokens) {
    return tokens.map(t => String.fromCharCode(t)).join('');
  }

  // Get embedding for token
  _getEmbedding(token) {
    const start = token * this.hiddenSize;
    return Array.from(this.embeddings.slice(start, start + this.hiddenSize));
  }

  // Simple dot product attention
  _attention(query, keys, values) {
    const scores = keys.map(k =>
      query.reduce((sum, q, i) => sum + q * k[i], 0)
    );

    // Softmax
    const maxScore = Math.max(...scores);
    const expScores = scores.map(s => Math.exp((s - maxScore) / this.temperature));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    const weights = expScores.map(e => e / sumExp);

    // Weighted sum of values
    const result = new Array(this.hiddenSize).fill(0);
    for (let i = 0; i < values.length; i++) {
      for (let j = 0; j < this.hiddenSize; j++) {
        result[j] += weights[i] * values[i][j];
      }
    }
    return result;
  }

  // Forward pass for single token
  _forward(embeddings) {
    if (embeddings.length === 0) return new Array(this.hiddenSize).fill(0);

    // Simple self-attention
    const query = embeddings[embeddings.length - 1];
    const output = this._attention(query, embeddings, embeddings);

    // Layer norm (simplified)
    const mean = output.reduce((a, b) => a + b, 0) / output.length;
    const variance = output.reduce((a, b) => a + (b - mean) ** 2, 0) / output.length;
    const std = Math.sqrt(variance + 1e-6);
    return output.map(x => (x - mean) / std);
  }

  // Generate next token
  _generateToken(hidden) {
    // Project to vocab size
    const logits = new Array(this.vocabSize).fill(0);
    for (let v = 0; v < this.vocabSize; v++) {
      for (let h = 0; h < this.hiddenSize; h++) {
        logits[v] += hidden[h] * this.output[v * this.hiddenSize + h];
      }
    }

    // Sample with temperature
    const maxLogit = Math.max(...logits);
    const expLogits = logits.map(l => Math.exp((l - maxLogit) / this.temperature));
    const sumExp = expLogits.reduce((a, b) => a + b, 0);
    const probs = expLogits.map(e => e / sumExp);

    // Sample from distribution
    const r = Math.random();
    let cumsum = 0;
    for (let i = 0; i < probs.length; i++) {
      cumsum += probs[i];
      if (r < cumsum) return i;
    }
    return probs.length - 1;
  }

  // Process text and return embedding
  encode(text) {
    const start = performance.now();
    const tokens = this.tokenize(text);
    const embeddings = tokens.map(t => this._getEmbedding(t));
    const output = this._forward(embeddings);

    this.stats.tokensProcessed += tokens.length;
    this.stats.inferenceCount++;
    const latency = performance.now() - start;
    this.stats.avgLatency = (this.stats.avgLatency * (this.stats.inferenceCount - 1) + latency) / this.stats.inferenceCount;

    return output;
  }

  // Generate continuation
  generate(prompt, maxTokens = 20) {
    const start = performance.now();
    const tokens = this.tokenize(prompt);
    const embeddings = tokens.map(t => this._getEmbedding(t));

    const generated = [];
    for (let i = 0; i < maxTokens; i++) {
      const hidden = this._forward(embeddings);
      const nextToken = this._generateToken(hidden);
      generated.push(nextToken);
      embeddings.push(this._getEmbedding(nextToken));

      // Stop at newline or special char
      if (nextToken === 10 || nextToken === 0) break;
    }

    this.stats.tokensProcessed += tokens.length + generated.length;
    this.stats.inferenceCount++;

    return this.detokenize(generated);
  }

  // Process for SCADA context - returns structured analysis
  process(text) {
    const embedding = this.encode(text);

    // Simple classification based on embedding
    const categories = {
      alarm: embedding[0] > 0,
      status: embedding[1] > 0,
      command: embedding[2] > 0,
      query: embedding[3] > 0
    };

    // Sentiment/urgency score
    const urgency = embedding.slice(4, 8).reduce((a, b) => a + Math.abs(b), 0);

    // Extract key terms (simplified)
    const terms = text.toLowerCase()
      .split(/\W+/)
      .filter(t => t.length > 2)
      .slice(0, 5);

    return {
      embedding,
      categories,
      urgency: Math.min(1, urgency),
      terms,
      timestamp: Date.now()
    };
  }

  // Async wrapper for heavy processing
  async processAsync(text) {
    return new Promise(resolve => {
      setTimeout(() => resolve(this.process(text)), 0);
    });
  }

  // Compare two texts by embedding similarity
  similarity(text1, text2) {
    const emb1 = this.encode(text1);
    const emb2 = this.encode(text2);

    // Cosine similarity
    let dot = 0, norm1 = 0, norm2 = 0;
    for (let i = 0; i < this.hiddenSize; i++) {
      dot += emb1[i] * emb2[i];
      norm1 += emb1[i] ** 2;
      norm2 += emb2[i] ** 2;
    }
    return dot / (Math.sqrt(norm1) * Math.sqrt(norm2) + 1e-6);
  }

  // Get statistics
  getStats() {
    return { ...this.stats };
  }

  // Reset model state
  reset() {
    this.embeddings = this._initEmbeddings();
    this.attention = this._initAttention();
    this.output = this._initOutput();
    this.stats = { tokensProcessed: 0, inferenceCount: 0, avgLatency: 0 };
  }
}

// Default instance
export const femtoLLM = new FemtoLLM();

// SCADA-specific processing helpers
export const SCADAProcessor = {
  // Classify alarm text
  classifyAlarm(text) {
    const result = femtoLLM.process(text);
    const keywords = {
      critical: ['critical', 'emergency', 'failure', 'shutdown', 'danger'],
      warning: ['warning', 'high', 'low', 'deviation', 'approaching'],
      info: ['normal', 'ok', 'stable', 'running', 'online']
    };

    const textLower = text.toLowerCase();
    for (const [level, words] of Object.entries(keywords)) {
      if (words.some(w => textLower.includes(w))) {
        return { level, ...result };
      }
    }
    return { level: 'unknown', ...result };
  },

  // Extract command from text
  parseCommand(text) {
    const result = femtoLLM.process(text);
    const commands = ['start', 'stop', 'reset', 'set', 'get', 'status', 'enable', 'disable'];
    const textLower = text.toLowerCase();

    for (const cmd of commands) {
      if (textLower.includes(cmd)) {
        const target = textLower.replace(cmd, '').trim().split(/\s+/)[0];
        return { command: cmd, target, ...result };
      }
    }
    return { command: null, ...result };
  }
};

export default FemtoLLM;
