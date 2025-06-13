import { Rectangle } from '../utils/Rectangle';

export type PlatformType = 'ground' | 'floating' | 'moving' | 'breakable';

export class Platform {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public type: PlatformType;
  
  private originalX: number;
  private originalY: number;
  private moveSpeed = 50;
  private moveRange = 100;
  private moveDirection = 1;
  private moveTime = 0;

  constructor(x: number, y: number, width: number, height: number, type: PlatformType) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.originalX = x;
    this.originalY = y;
  }

  public update(deltaTime: number): void {
    if (this.type === 'moving') {
      this.moveTime += deltaTime;
      
      // Horizontal movement
      const offset = Math.sin(this.moveTime * 2) * this.moveRange;
      this.x = this.originalX + offset;
    }
  }

  public getBounds(): Rectangle {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Different colors for different platform types
    switch (this.type) {
      case 'ground':
        ctx.fillStyle = '#8B4513';
        break;
      case 'floating':
        ctx.fillStyle = '#CD853F';
        break;
      case 'moving':
        ctx.fillStyle = '#DAA520';
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 5;
        break;
      case 'breakable':
        ctx.fillStyle = '#A0522D';
        break;
    }

    // Main platform body
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Add platform details
    if (this.type === 'ground') {
      // Add texture to ground platforms
      ctx.fillStyle = '#654321';
      for (let i = 0; i < this.width; i += 16) {
        for (let j = 0; j < this.height; j += 16) {
          if (Math.random() > 0.7) {
            ctx.fillRect(this.x + i, this.y + j, 4, 4);
          }
        }
      }
    }

    // Platform border
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(this.x, this.y, this.width, 4);

    ctx.restore();
  }
}