/* UDT:ISAchieve/SCADA/PLC|v1.0.0|2024-12-15|SysAdmin|PLC simulation for SCADA sandbox|#SCADA#PLC#Simulation */

/**
 * PLC Simulator
 * Simulates Modbus-style registers and coils
 * For SCADA sandbox testing
 */

export class PLCSimulator {
  constructor(id, config = {}) {
    this.id = id;
    this.name = config.name || `PLC_${id}`;

    // Modbus-style registers
    this.holdingRegisters = new Uint16Array(config.registerCount || 1000);
    this.inputRegisters = new Uint16Array(config.inputCount || 1000);
    this.coils = new Uint8Array(config.coilCount || 1000);
    this.discreteInputs = new Uint8Array(config.discreteCount || 1000);

    // Status
    this.status = 'stopped';
    this.scanRate = config.scanRate || 100; // ms
    this.scanCount = 0;
    this.lastScan = 0;

    // Program logic
    this.ladder = [];
    this.alarms = [];
    this.scanInterval = null;

    // Statistics
    this.stats = {
      reads: 0,
      writes: 0,
      scans: 0,
      errors: 0
    };
  }

  // Start PLC scan cycle
  start() {
    if (this.status === 'running') return;
    this.status = 'running';
    this.scanInterval = setInterval(() => this._scan(), this.scanRate);
    return this;
  }

  // Stop PLC
  stop() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    this.status = 'stopped';
    return this;
  }

  // Main scan cycle
  _scan() {
    this.scanCount++;
    this.lastScan = Date.now();
    this.stats.scans++;

    // Execute ladder logic
    for (const rung of this.ladder) {
      try {
        this._executeRung(rung);
      } catch (err) {
        this.stats.errors++;
        console.error(`PLC ${this.id} rung error:`, err);
      }
    }

    // Check alarms
    this._checkAlarms();

    // Simulate process updates
    this._simulateProcess();
  }

  // Execute a ladder rung
  _executeRung(rung) {
    const { conditions, actions } = rung;

    // Evaluate conditions (AND logic)
    let result = true;
    for (const cond of conditions) {
      const value = this._readAddress(cond.address);
      switch (cond.type) {
        case 'NO': result = result && (value !== 0); break; // Normally Open
        case 'NC': result = result && (value === 0); break; // Normally Closed
        case 'GT': result = result && (value > cond.value); break;
        case 'LT': result = result && (value < cond.value); break;
        case 'EQ': result = result && (value === cond.value); break;
      }
      if (!result) break;
    }

    // Execute actions if conditions met
    if (result) {
      for (const action of actions) {
        this._writeAddress(action.address, action.value);
      }
    }
  }

  // Read from address (Modbus-style)
  _readAddress(address) {
    const [type, idx] = this._parseAddress(address);
    this.stats.reads++;

    switch (type) {
      case 'HR': return this.holdingRegisters[idx];
      case 'IR': return this.inputRegisters[idx];
      case 'C': return this.coils[idx];
      case 'DI': return this.discreteInputs[idx];
      default: return 0;
    }
  }

  // Write to address
  _writeAddress(address, value) {
    const [type, idx] = this._parseAddress(address);
    this.stats.writes++;

    switch (type) {
      case 'HR': this.holdingRegisters[idx] = value; break;
      case 'C': this.coils[idx] = value ? 1 : 0; break;
      default: console.warn(`Cannot write to ${type}`);
    }
  }

  // Parse address string (HR100, C50, etc.)
  _parseAddress(address) {
    const match = address.match(/^(HR|IR|C|DI)(\d+)$/i);
    if (match) {
      return [match[1].toUpperCase(), parseInt(match[2])];
    }
    return ['HR', parseInt(address) || 0];
  }

  // Check alarm conditions
  _checkAlarms() {
    for (const alarm of this.alarms) {
      const value = this._readAddress(alarm.address);
      let triggered = false;

      switch (alarm.type) {
        case 'HIGH': triggered = value > alarm.setpoint; break;
        case 'LOW': triggered = value < alarm.setpoint; break;
        case 'EQUAL': triggered = value === alarm.setpoint; break;
        case 'DEVIATION':
          triggered = Math.abs(value - alarm.setpoint) > alarm.deadband;
          break;
      }

      if (triggered && !alarm.active) {
        alarm.active = true;
        alarm.triggeredAt = Date.now();
        this._onAlarm(alarm);
      } else if (!triggered && alarm.active) {
        alarm.active = false;
        alarm.clearedAt = Date.now();
      }
    }
  }

  // Alarm callback
  _onAlarm(alarm) {
    console.log(`[ALARM] PLC ${this.id}: ${alarm.name} - ${alarm.message}`);
  }

  // Simulate process dynamics
  _simulateProcess() {
    // Example: Temperature simulation with noise
    const tempAddr = 100;
    const setpoint = this.holdingRegisters[200] || 100;
    const current = this.inputRegisters[tempAddr];

    // Simple first-order dynamics
    const error = setpoint - current;
    const change = error * 0.1 + (Math.random() - 0.5) * 2;
    this.inputRegisters[tempAddr] = Math.max(0, Math.min(500, current + change));

    // Pressure simulation
    const pressAddr = 101;
    this.inputRegisters[pressAddr] = 100 + Math.sin(this.scanCount / 100) * 20 + (Math.random() - 0.5) * 5;

    // Flow simulation
    const flowAddr = 102;
    const pumpOn = this.coils[0];
    this.inputRegisters[flowAddr] = pumpOn ? 75 + (Math.random() - 0.5) * 10 : 0;
  }

  // Add ladder rung
  addRung(conditions, actions) {
    this.ladder.push({ conditions, actions });
    return this;
  }

  // Add alarm definition
  addAlarm(config) {
    this.alarms.push({
      id: this.alarms.length,
      active: false,
      triggeredAt: null,
      clearedAt: null,
      ...config
    });
    return this;
  }

  // Read holding register(s)
  readHR(start, count = 1) {
    this.stats.reads += count;
    return Array.from(this.holdingRegisters.slice(start, start + count));
  }

  // Write holding register(s)
  writeHR(start, values) {
    const vals = Array.isArray(values) ? values : [values];
    this.stats.writes += vals.length;
    for (let i = 0; i < vals.length; i++) {
      this.holdingRegisters[start + i] = vals[i];
    }
    return this;
  }

  // Read input registers
  readIR(start, count = 1) {
    this.stats.reads += count;
    return Array.from(this.inputRegisters.slice(start, start + count));
  }

  // Read coil(s)
  readCoil(start, count = 1) {
    this.stats.reads += count;
    return Array.from(this.coils.slice(start, start + count));
  }

  // Write coil(s)
  writeCoil(start, values) {
    const vals = Array.isArray(values) ? values : [values];
    this.stats.writes += vals.length;
    for (let i = 0; i < vals.length; i++) {
      this.coils[start + i] = vals[i] ? 1 : 0;
    }
    return this;
  }

  // Get status
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      scanRate: this.scanRate,
      scanCount: this.scanCount,
      lastScan: this.lastScan,
      stats: { ...this.stats },
      alarms: this.alarms.filter(a => a.active).map(a => ({
        name: a.name,
        message: a.message,
        triggeredAt: a.triggeredAt
      }))
    };
  }
}

// PLC Manager
export class PLCManager {
  constructor() {
    this.plcs = new Map();
  }

  create(id, config = {}) {
    const plc = new PLCSimulator(id, config);
    this.plcs.set(id, plc);
    return plc;
  }

  get(id) {
    return this.plcs.get(id);
  }

  list() {
    return Array.from(this.plcs.values());
  }

  startAll() {
    for (const plc of this.plcs.values()) {
      plc.start();
    }
  }

  stopAll() {
    for (const plc of this.plcs.values()) {
      plc.stop();
    }
  }
}

// Default manager
export const plcManager = new PLCManager();

export default PLCSimulator;
