import { Rectangle } from '../utils/Rectangle';

export type CollectibleType = 'coin' | 'gem' | 'star';

export class Collectible {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public type: CollectibleType;
  public value: number;
  public color: string;
  
  private animationFrame = 0;
  private animationTimer = 0;
  private rotationAngle = 0;
  private bobOffset = 0;
  private bobTimer = 0;

  constructor(x: number, y: number, type: CollectibleType) {
    this.x = x;
    this.y = y;
    this.type = type;
    
    switch (type) {
      case 'coin':
        this.width = 16;
        this.height = 16;
        this.value = 100;
        this.color = '#FFD700';
        break;
      case 'gem':
        this.width = 20;
        this.height = 20;
        this.value = 500;
        this.color = '#FF69B4';
        break;
      case 'star':
        this.width = 24;
        this.height = 24;
        this.value = 1000;
        this.color = '#00CED1';
        break;
    }
  }

  public update(deltaTime: number): void {
    // Rotation animation
    this.rotationAngle += deltaTime * 3;
    if (this.rotationAngle >= Math.PI * 2) {
      this.rotationAngle = 0;
    }
    
    // Bobbing animation
    this.bobTimer += deltaTime * 4;
    this.bobOffset = Math.sin(this.bobTimer) * 3;
    
    // Frame animation for gems
    if (this.type === 'gem') {
      this.animationTimer += deltaTime;
      if (this.animationTimer >= 0.1) {
        this.animationFrame = (this.animationFrame + 1) % 6;
        this.animationTimer = 0;
      }
    }
  }

  public getBounds(): Rectangle {
    return new Rectangle(this.x, this.y + this.bobOffset, this.width, this.height);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2 + this.bobOffset;
    
    ctx.translate(centerX, centerY);
    ctx.rotate(this.rotationAngle);
    
    switch (this.type) {
      case 'coin':
        this.renderCoin(ctx);
        break;
      case 'gem':
        this.renderGem(ctx);
        break;
      case 'star':
        this.renderStar(ctx);
        break;
    }
    
    ctx.restore();
  }

  private renderCoin(ctx: CanvasRenderingContext2D): void {
    // Outer circle
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner circle
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(0, 0, this.width / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Center symbol
    ctx.fillStyle = '#FFD700';
    ctx.font = `${this.width - 4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);
  }

  private renderGem(ctx: CanvasRenderingContext2D): void {
    // Gem shape
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(0, -this.height / 2);
    ctx.lineTo(this.width / 3, -this.height / 4);
    ctx.lineTo(this.width / 2, this.height / 2);
    ctx.lineTo(-this.width / 2, this.height / 2);
    ctx.lineTo(-this.width / 3, -this.height / 4);
    ctx.closePath();
    ctx.fill();
    
    // Gem highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.moveTo(-this.width / 4, -this.height / 3);
    ctx.lineTo(this.width / 6, -this.height / 3);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    
    // Sparkle effect based on animation frame
    const sparkleAlpha = Math.sin(this.animationFrame * Math.PI / 3) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
    ctx.beginPath();
    ctx.arc(this.width / 4, -this.height / 4, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderStar(ctx: CanvasRenderingContext2D): void {
    const spikes = 5;
    const outerRadius = this.width / 2;
    const innerRadius = outerRadius * 0.5;
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i * Math.PI) / spikes;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.closePath();
    ctx.fill();
    
    // Star glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    
    // Center highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}