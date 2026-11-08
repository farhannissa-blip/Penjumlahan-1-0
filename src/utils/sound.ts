// Synthesized Web Audio API Procedural Sound Engine for Pancake Master

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  // Continuous procedural stove flame nodes
  private flameSource: AudioBufferSourceNode | null = null;
  private flameFilter: BiquadFilterNode | null = null;
  private flameGain: GainNode | null = null;
  private flameLfo: OscillatorNode | null = null;
  private flameLfoGain: GainNode | null = null;
  private isFlameRunning: boolean = false;
  private lastCrackleTime: number = 0;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopStoveFire();
    }
  }

  /**
   * Starts the continuous procedural gas stove flame roar and initializes crackle timing.
   */
  public startStoveFire() {
    if (this.isMuted || this.isFlameRunning) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      // Create a 2-second seamless looping brown/pink noise buffer for the stove burner roar
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.04 * white) / 1.04;
        lastOut = output[i];
        output[i] *= 2.8; // Normalize warm rumble
      }

      const source = ctx.createBufferSource();
      source.buffer = noiseBuffer;
      source.loop = true;

      // Lowpass filter that opens up as heat increases
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, ctx.currentTime);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      // LFO to modulate filter frequency (simulates flickering stove flames)
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(4.5, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(45, ctx.currentTime);

      const masterFlameGain = ctx.createGain();
      masterFlameGain.gain.setValueAtTime(0.035, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      source.connect(filter);
      filter.connect(masterFlameGain);
      masterFlameGain.connect(ctx.destination);

      source.start();
      lfo.start();

      this.flameSource = source;
      this.flameFilter = filter;
      this.flameGain = masterFlameGain;
      this.flameLfo = lfo;
      this.flameLfoGain = lfoGain;
      this.isFlameRunning = true;
      this.lastCrackleTime = performance.now();
    } catch {
      // Ignore audio context restrictions
    }
  }

  /**
   * Dynamically updates stove flame roar & triggers procedural fire/skillet crackles
   * based on heatRatio (0 = fresh/100% time left, 1 = critical/0% time left).
   */
  public updateStoveFireIntensity(heatRatio: number) {
    if (this.isMuted) {
      this.stopStoveFire();
      return;
    }
    if (!this.isFlameRunning) {
      this.startStoveFire();
    }

    const ctx = this.getContext();
    if (!ctx) return;

    const clamped = Math.max(0, Math.min(1, heatRatio));
    const now = ctx.currentTime;

    // 1. Modulate continuous stove burner roar (faster flicker & brighter roar as time runs low)
    if (this.flameFilter && this.flameGain && this.flameLfo && this.flameLfoGain) {
      const targetCutoff = 170 + Math.pow(clamped, 1.4) * 520; // 170Hz -> 690Hz
      const targetFlickerHz = 4.5 + Math.pow(clamped, 1.5) * 15.5; // 4.5Hz -> 20Hz flutter
      const targetLfoDepth = 40 + clamped * 130;
      const targetVolume = 0.03 + Math.pow(clamped, 1.2) * 0.11; // 0.03 -> 0.14

      this.flameFilter.frequency.setTargetAtTime(targetCutoff, now, 0.08);
      this.flameLfo.frequency.setTargetAtTime(targetFlickerHz, now, 0.08);
      this.flameLfoGain.gain.setTargetAtTime(targetLfoDepth, now, 0.08);
      this.flameGain.gain.setTargetAtTime(targetVolume, now, 0.08);
    }

    // 2. Trigger procedural fire crackling & skillet sizzle pops at dynamic intervals
    // Interval shrinks from ~650ms (gentle) down to ~110ms (frantic crackling)
    const nowMs = performance.now();
    const minIntervalMs = Math.max(110, 650 - Math.pow(clamped, 1.15) * 540);
    if (nowMs - this.lastCrackleTime >= minIntervalMs) {
      this.lastCrackleTime = nowMs;
      this.triggerProceduralCrackleBurst(clamped);
    }
  }

  /**
   * Synthesizes a cluster of crisp fire crackle pops and sizzling oil/butter snaps.
   * Higher heatRatio produces more rapid sub-pops with sharper resonance.
   */
  private triggerProceduralCrackleBurst(heatRatio: number) {
    const ctx = this.getContext();
    if (!ctx) return;

    // Number of micro-crackles in this burst scales from 1..2 (calm) to 3..5 (critical)
    const popCount =
      heatRatio >= 0.75
        ? 3 + Math.floor(Math.random() * 3)
        : heatRatio >= 0.4
        ? 2 + Math.floor(Math.random() * 2)
        : 1 + (Math.random() > 0.65 ? 1 : 0);

    for (let i = 0; i < popCount; i++) {
      const delaySec = i * (0.018 + Math.random() * 0.035);
      const startTime = ctx.currentTime + delaySec;
      const duration = 0.015 + Math.random() * 0.025;

      // Short impulse noise buffer for a single fire crackle pop
      const bufferSize = Math.max(64, Math.floor(ctx.sampleRate * duration));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        // Sharp exponential decay envelope inside the impulse
        const env = Math.pow(1 - j / bufferSize, 2.2);
        data[j] = (Math.random() * 2 - 1) * env;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter tuned to crisp wood/gas crackle & hot skillet sizzle frequencies
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      const baseCenterFreq = 1600 + heatRatio * 2400 + Math.random() * 1400;
      filter.frequency.setValueAtTime(baseCenterFreq, startTime);
      filter.Q.setValueAtTime(2.5 + heatRatio * 3.5, startTime);

      const gain = ctx.createGain();
      const peakGain = (0.028 + heatRatio * 0.095) * (0.75 + Math.random() * 0.4);
      gain.gain.setValueAtTime(peakGain, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(startTime);
      noise.stop(startTime + duration + 0.005);
    }
  }

  /**
   * Stops the continuous stove flame sound cleanly.
   */
  public stopStoveFire() {
    if (!this.isFlameRunning) return;
    try {
      if (this.flameSource) {
        this.flameSource.stop();
        this.flameSource.disconnect();
      }
      if (this.flameLfo) {
        this.flameLfo.stop();
        this.flameLfo.disconnect();
      }
      if (this.flameFilter) this.flameFilter.disconnect();
      if (this.flameGain) this.flameGain.disconnect();
      if (this.flameLfoGain) this.flameLfoGain.disconnect();
    } catch {
      // Ignore already stopped nodes
    } finally {
      this.flameSource = null;
      this.flameFilter = null;
      this.flameGain = null;
      this.flameLfo = null;
      this.flameLfoGain = null;
      this.isFlameRunning = false;
    }
  }

  public playSelectPancake(num: number) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Pitch scales cheerfully with the pancake number
    const baseFreq = 320 + num * 38;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.35, now + 0.11);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);

    // Subtle sizzle burst when tapping pancake on hot skillet
    this.playSizzleBurst(0.12);
  }

  public playRemovePancake() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.1);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playSizzleBurst(duration = 0.25) {
    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.5));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3200;
    filter.Q.value = 1.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  }

  public playReadyToFlipChime() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25]; // C5, E5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.18, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.19);
    });
  }

  public playFlipSuccess() {
    this.stopStoveFire();
    const ctx = this.getContext();
    if (ctx) {
      const now = ctx.currentTime;
      // Whoosh flip upward sound
      const whooshOsc = ctx.createOscillator();
      const whooshGain = ctx.createGain();
      whooshOsc.type = 'sine';
      whooshOsc.frequency.setValueAtTime(220, now);
      whooshOsc.frequency.exponentialRampToValueAtTime(680, now + 0.22);
      whooshGain.gain.setValueAtTime(0.2, now);
      whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      whooshOsc.connect(whooshGain);
      whooshGain.connect(ctx.destination);
      whooshOsc.start(now);
      whooshOsc.stop(now + 0.26);

      // Golden arpeggio fanfare
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + 0.18 + idx * 0.085;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.24, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.36);
      });
    }
  }

  /**
   * Plays celebratory fireworks launch whistle, twin aerial bursts, and sparkle chimes for Fast Bonus!
   */
  public playFastBonusFireworks() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Rising firework whistle
    const whistle = ctx.createOscillator();
    const whistleGain = ctx.createGain();
    whistle.type = 'sine';
    whistle.frequency.setValueAtTime(420, now);
    whistle.frequency.exponentialRampToValueAtTime(1680, now + 0.22);
    whistleGain.gain.setValueAtTime(0.12, now);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    whistle.connect(whistleGain);
    whistleGain.connect(ctx.destination);
    whistle.start(now);
    whistle.stop(now + 0.25);

    // 2. Twin aerial firework explosion bursts (at +0.22s and +0.46s)
    [0.22, 0.46].forEach((burstDelay, bIdx) => {
      const burstStart = now + burstDelay;
      const duration = 0.32;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.8);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(bIdx === 0 ? 1800 : 2400, burstStart);
      filter.Q.setValueAtTime(1.2, burstStart);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.22, burstStart);
      gain.gain.exponentialRampToValueAtTime(0.001, burstStart + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(burstStart);
      noise.stop(burstStart + duration + 0.02);
    });

    // 3. High-register sparkle glockenspiel notes
    const sparkleNotes = [1046.5, 1318.51, 1567.98, 2093.0]; // C6, E6, G6, C7
    sparkleNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + 0.24 + idx * 0.065;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.16, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.29);
    });
  }

  public playWrongPairTryAgain() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [310, 260];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.11;
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.14, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.15);
    });
  }

  public playCookingAlarmBurn() {
    this.stopStoveFire();
    const ctx = this.getContext();
    if (ctx) {
      const now = ctx.currentTime;
      // Kitchen alarm double beep + low burn thud
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + i * 0.16;
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, start);
        osc.frequency.setValueAtTime(440, start + 0.07);
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.15);
      }
      this.playSizzleBurst(0.45);
    }
  }

  public playTimerWarningTick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(760, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playLevelUp() {
    this.stopStoveFire();
    const ctx = this.getContext();
    if (ctx) {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.09;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.24, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.36);
      });
    }
  }
}

export const soundEngine = new SoundEngine();
