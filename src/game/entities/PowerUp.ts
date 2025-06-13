import { Rectangle } from '../utils/Rectangle';
import { PowerUpType } from './Player';

export class PowerUp {
  public x: number;
  public y: number;
  public width = 32;
  public height = 32;
  public type: PowerUpType;
  public value: number;
  public color: string;
  
  private animationTimer = 0;
  private pulseScale = 1;
  private rotationAngle = 0;

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.value = 200;
    
    switch (type) {
      case 'speed':
        this.color = '#00FF00';
        break;
      case 'jump':
        this.color = '#FFFF00';
        break;
      case 'size':
        this.color = '#FF8800';
        break;
      case 'invincible':
        this.color = '#FF00FF';
        break;
    }
  }

  public update(deltaTime: number): void {
    this.animationTimer += deltaTime;
    
    // Pulsing effect
    this.pulseScale = 1 + Math.sin(this.animationTimer * 6) * 0.1;
    
    // Rotation
    this.rotationAngle += deltaTime * 2;
    if (this.rotationAngle >= Math.PI * 2) {
      this.rotationAngle = 0;
    }
  }

  public getBounds(): Rectangle {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotationAngle);
    ctx.scale(this.pulseScale, this.pulseScale);
    
    // Glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    
    // Main power-up shape
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    // Border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    
    // Type-specific symbol
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    switch (this.type) {
      case 'speed':
        ctx.fillText('S', 0, 0);
        break;
      case 'jump':
        ctx.fillText('J', 0, 0);
        break;
      case 'size':
        ctx.fillText('T', 0, 0);
        break;
      case 'invincible':
        ctx.fillText('★', 0, 0);
        break;
    }
    
    ctx.restore();
  }
}