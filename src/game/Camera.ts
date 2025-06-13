import { Player } from './entities/Player';

export class Camera {
  public x: number = 0;
  public y: number = 0;
  public width: number;
  public height: number;
  
  private target: Player | null = null;
  private smoothing = 0.1;
  private offsetX = 0;
  private offsetY = 0;
  private shakeX = 0;
  private shakeY = 0;
  private shakeIntensity = 0;
  private shakeDecay = 0.9;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public setTarget(target: Player): void {
    this.target = target;
  }

  public update(deltaTime: number): void {
    if (this.target) {
      // Calculate desired camera position
      const targetX = this.target.x - this.width / 2 + this.target.width / 2;
      const targetY = this.target.y - this.height / 2 + this.target.height / 2;
      
      // Smooth camera movement
      this.x += (targetX - this.x) * this.smoothing;
      this.y += (targetY - this.y) * this.smoothing;
      
      // Keep camera within bounds (if needed)
      this.x = Math.max(0, this.x);
      this.y = Math.max(-100, Math.min(100, this.y)); // Allow some vertical movement
    }
    
    // Update screen shake
    this.updateScreenShake(deltaTime);
  }

  private updateScreenShake(deltaTime: number): void {
    if (this.shakeIntensity > 0) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= this.shakeDecay;
      
      if (this.shakeIntensity < 0.1) {
        this.shakeIntensity = 0;
        this.shakeX = 0;
        this.shakeY = 0;
      }
    }
  }

  public shake(intensity: number): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }

  public apply(ctx: CanvasRenderingContext2D): void {
    ctx.translate(
      -this.x + this.offsetX + this.shakeX,
      -this.y + this.offsetY + this.shakeY
    );
  }

  public getViewBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
}