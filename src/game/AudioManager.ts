import { GameSettings } from '../contexts/SettingsContext';

export class AudioManager {
  private isMuted = false;
  private sounds: Map<string, AudioBuffer> = new Map();
  private audioContext: AudioContext | null = null;
  private backgroundMusic: AudioBufferSourceNode | null = null;
  private settings: GameSettings;
  private masterGainNode: GainNode | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;

  constructor(settings: GameSettings) {
    this.settings = settings;
    this.initializeAudioContext();
    this.createSounds();
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.masterGainNode = this.audioContext.createGain();
      this.musicGainNode = this.audioContext.createGain();
      this.sfxGainNode = this.audioContext.createGain();
      
      // Connect gain nodes
      this.musicGainNode.connect(this.masterGainNode);
      this.sfxGainNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.audioContext.destination);
      
      // Set initial volumes
      this.updateVolumes();
    } catch (error) {
      console.warn('AudioContext not supported');
    }
  }

  private updateVolumes(): void {
    if (!this.masterGainNode || !this.musicGainNode || !this.sfxGainNode) return;
    
    this.masterGainNode.gain.value = this.settings.audio.masterVolume;
    this.musicGainNode.gain.value = this.settings.audio.musicVolume;
    this.sfxGainNode.gain.value = this.settings.audio.sfxVolume;
  }

  private createSounds(): void {
    // Create synthetic sounds using Web Audio API
    if (!this.audioContext) return;

    this.createSound('jump', this.createJumpSound());
    this.createSound('collect', this.createCollectSound());
    this.createSound('powerUp', this.createPowerUpSound());
    this.createSound('enemyHit', this.createEnemyHitSound());
    this.createSound('playerHit', this.createPlayerHitSound());
    this.createSound('levelComplete', this.createLevelCompleteSound());
  }

  private createSound(name: string, audioBuffer: AudioBuffer): void {
    this.sounds.set(name, audioBuffer);
  }

  private createJumpSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.audioContext.sampleRate * 0.2;
    const buffer = this.audioContext.createBuffer(1, length, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.audioContext.sampleRate;
      const frequency = 440 * Math.pow(2, -t * 2);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 5) * 0.3;
    }
    
    return buffer;
  }

  private createCollectSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, length, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.audioContext.sampleRate;
      const frequency = 880 + Math.sin(t * 40) * 200;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 10) * 0.2;
    }
    
    return buffer;
  }

  private createPowerUpSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.audioContext.sampleRate * 0.5;
    const buffer = this.audioContext.createBuffer(1, length, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.audioContext.sampleRate;
      const frequency = 220 * Math.pow(2, t * 3);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2) * 0.3;
    }
    
    return buffer;
  }

  private createEnemyHitSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.audioContext.sampleRate * 0.15;
    const buffer = this.audioContext.createBuffer(1, length, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.audioContext.sampleRate;
      const noise = (Math.random() - 0.5) * 2;
      data[i] = noise * Math.exp(-t * 8) * 0.2;
    }
    
    return buffer;
  }

  private createPlayerHitSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(1, length, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
      const t = i / this.audioContext.sampleRate;
      const frequency = 150 * Math.pow(2, -t);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3) * 0.4;
    }
    
    return buffer;
  }

  private createLevelCompleteSound(): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ length: 1, sampleRate: 44100 });
    
    const length = this.audioContext.sampleRate * 1;
    const buffer = this.audioContext.createBuffer(1, length, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
    
    for (let i = 0; i < length; i++) {
      const t = i / this.audioContext.sampleRate;
      const noteIndex = Math.floor(t * 4) % notes.length;
      const frequency = notes[noteIndex];
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2) * 0.3;
    }
    
    return buffer;
  }

  public playSound(name: string): void {
    if (this.isMuted || this.settings.audio.muted || !this.audioContext || !this.sounds.has(name) || !this.sfxGainNode) return;
    
    const source = this.audioContext.createBufferSource();
    source.buffer = this.sounds.get(name)!;
    source.connect(this.sfxGainNode);
    source.start();
  }

  public playBackgroundMusic(): void {
    if (this.isMuted || this.settings.audio.muted || !this.audioContext || !this.musicGainNode) return;
    
    // Create a simple background music loop
    const length = this.audioContext.sampleRate * 4; // 4 seconds
    const buffer = this.audioContext.createBuffer(1, length, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    const melody = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
    
    for (let i = 0; i < length; i++) {
      const t = i / this.audioContext.sampleRate;
      const noteIndex = Math.floor(t * 2) % melody.length;
      const frequency = melody[noteIndex];
      data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.1;
    }
    
    this.backgroundMusic = this.audioContext.createBufferSource();
    this.backgroundMusic.buffer = buffer;
    this.backgroundMusic.loop = true;
    this.backgroundMusic.connect(this.musicGainNode);
    this.backgroundMusic.start();
  }

  public pauseBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic = null;
    }
  }

  public resumeBackgroundMusic(): void {
    if (!this.backgroundMusic) {
      this.playBackgroundMusic();
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    
    if (muted && this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic = null;
    } else if (!muted && !this.backgroundMusic) {
      this.playBackgroundMusic();
    }
  }

  public updateSettings(settings: GameSettings): void {
    this.settings = settings;
    this.updateVolumes();
  }

  public destroy(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
      this.backgroundMusic = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}