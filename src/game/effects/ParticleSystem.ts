import { GameSettings } from '../../contexts/SettingsContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  alpha: number;
  type: 'spark' | 'explosion' | 'sparkle' | 'trail';
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private settings: GameSettings;
  private maxParticles: number;
  private qualityMultiplier: number = 1;

  constructor(settings: GameSettings) {
    this.settings = settings;
    this.maxParticles = settings.graphics.particleEffects ? 200 : 50;
    this.qualityMultiplier = settings.graphics.particleEffects ? 1 : 0.5;
  }

  public update(deltaTime: number): void {
    if (!this.settings.graphics.particleEffects) {
      this.particles = this.particles.slice(0, 20); // Keep minimal particles
    }

    this.particles = this.particles.filter(particle => {
      // Update particle position
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      
      // Apply gravity to some particle types
      if (particle.type === 'explosion' || particle.type === 'spark') {
        particle.vy += 300 * deltaTime;
      }
      
      // Update life
      particle.life -= deltaTime;
      particle.alpha = particle.life / particle.maxLife;
      
      // Apply friction
      particle.vx *= 0.98;
      particle.vy *= 0.98;
      
      return particle.life > 0;
    });

    // Limit particle count for performance
    if (this.particles.length > this.maxParticles) {
      this.particles = this.particles.slice(-this.maxParticles);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (!this.settings.graphics.particleEffects && this.particles.length === 0) return;

    ctx.save();
    
    this.particles.forEach(particle => {
      ctx.globalAlpha = particle.alpha;
      ctx.fillStyle = particle.color;
      
      switch (particle.type) {
        case 'spark':
        case 'explosion':
          ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
          break;
        case 'sparkle':
          this.renderSparkle(ctx, particle);
          break;
        case 'trail':
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
      }
    });
    
    ctx.restore();
  }

  private renderSparkle(ctx: CanvasRenderingContext2D, particle: Particle): void {
    const size = particle.size;
    ctx.save();
    ctx.translate(particle.x, particle.y);
    
    // Draw sparkle shape
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.3, -size * 0.3);
    ctx.lineTo(size, 0);
    ctx.lineTo(size * 0.3, size * 0.3);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.3, size * 0.3);
    ctx.lineTo(-size, 0);
    ctx.lineTo(-size * 0.3, -size * 0.3);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  public createExplosion(x: number, y: number, color: string): void {
    const particleCount = Math.floor(15 * this.qualityMultiplier);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = (100 + Math.random() * 100) * this.qualityMultiplier;
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        color,
        size: (3 + Math.random() * 3) * this.qualityMultiplier,
        alpha: 1,
        type: 'explosion'
      });
    }
  }

  public createSparkle(x: number, y: number, color: string): void {
    const particleCount = Math.floor(8 * this.qualityMultiplier);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (50 + Math.random() * 50) * this.qualityMultiplier;
      
      this.particles.push({
        x: x + Math.random() * 20 - 10,
        y: y + Math.random() * 20 - 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
        color,
        size: (2 + Math.random() * 3) * this.qualityMultiplier,
        alpha: 1,
        type: 'sparkle'
      });
    }
  }

  public createPowerUpEffect(x: number, y: number, color: string): void {
    const particleCount = Math.floor(20 * this.qualityMultiplier);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (80 + Math.random() * 80) * this.qualityMultiplier;
      
      this.particles.push({
        x: x + 16,
        y: y + 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 100,
        life: 1 + Math.random() * 0.5,
        maxLife: 1.5,
        color,
        size: (4 + Math.random() * 4) * this.qualityMultiplier,
        alpha: 1,
        type: 'spark'
      });
    }
  }

  public createTrail(x: number, y: number, color: string): void {
    if (!this.settings.graphics.particleEffects) return;
    
    this.particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
      life: 0.3,
      maxLife: 0.3,
      color,
      size: (2 + Math.random() * 2) * this.qualityMultiplier,
      alpha: 0.6,
      type: 'trail'
    });
  }

  public reduceQuality(): void {
    this.qualityMultiplier = Math.max(0.2, this.qualityMultiplier * 0.8);
    this.maxParticles = Math.floor(this.maxParticles * 0.8);
  }

  public updateSettings(settings: GameSettings): void {
    this.settings = settings;
    this.maxParticles = settings.graphics.particleEffects ? 200 : 50;
    this.qualityMultiplier = settings.graphics.particleEffects ? 1 : 0.5;
  }
}