export class AudioManager {
  private context: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private _initialized = false;

  async initialize(): Promise<void> {
    if (this._initialized) return;

    try {
      const ctx = new AudioContext();
      this.context = ctx;
      this.gainNode = ctx.createGain();
      this.gainNode.connect(ctx.destination);

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      this._initialized = true;
    } catch {
      // Audio not available
    }
  }

  get initialized(): boolean {
    return this._initialized;
  }

  async playTone(frequency: number, duration: number, type: OscillatorType = 'sine', gainValue = 0.1): Promise<void> {
    await this.initialize();

    if (!this.context || !this.gainNode) return;

    try {
      const oscillator = this.context.createOscillator();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
      oscillator.connect(this.gainNode);

      this.gainNode.gain.setValueAtTime(0, this.context.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(gainValue, this.context.currentTime + 0.1);
      this.gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

      oscillator.start();
      oscillator.stop(this.context.currentTime + duration);
    } catch {
      // Sound failed
    }
  }

  playNotification(): void {
    this.playTone(440, 0.2, 'triangle', 0.05);
  }

  playHover(): void {
    this.playTone(220, 0.1, 'sine', 0.02);
  }

  async preloadSounds(): Promise<void> {
    await this.initialize();
    this.playTone(0, 0);
  }
}

export const audioManager = new AudioManager();
