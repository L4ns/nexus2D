import { Rectangle } from '../utils/Rectangle';
import { Level } from '../Level';

export type EnemyType = 'goomba' | 'koopa' | 'spiky' | 'flying';

export class Enemy {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public type: EnemyType;
  
  private velocity = { x: 0, y: 0 };
  private speed = 60;
  private direction = -1;
  private health = 1;
  private gravity = 600;
  private isGrounded = false;
  private animationFrame = 0;
  private animationTimer = 0;
  private flyingOffset = 0;
  private flyingTimer = 0;

  constructor(x: number, y: number, type: EnemyType) {
    this.x = x;
    this.y = y;
    this.type = type;
    
    // Set size based on type
    switch (type) {
      case 'goomba':
        this.width = 24;
        this.height = 24;
        this.speed = 60;
        break;
      case 'koopa':
        this.width = 28;
        this.height = 32;
        this.speed = 80;
        this.health = 2;
        break;
      case 'spiky':
        this.width = 26;
        this.height = 26;
        this.speed = 40;
        this.health = 2;
        break;
      case 'flying':
        this.width = 30;
        this.height = 24;
        this.speed = 100;
        this.health = 1;
        break;
    }
  }

  public update(deltaTime: number, level: Level): void {
    this.updateMovement(deltaTime, level);
    this.updateAnimation(deltaTime);
    this.checkBounds(level);
  }

  private updateMovement(deltaTime: number, level: Level): void {
    switch (this.type) {
      case 'goomba':
      case 'koopa':
      case 'spiky':
        this.updateGroundMovement(deltaTime, level);
        break;
      case 'flying':
        this.updateFlyingMovement(deltaTime);
        break;
    }
  }

  private updateGroundMovement(deltaTime: number, level: Level): void {
    // Horizontal movement
    this.velocity.x = this.direction * this.speed;
    
    // Apply gravity
    this.velocity.y += this.gravity * deltaTime;
    
    // Update position
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;
    
    // Check platform collisions
    this.checkPlatformCollisions(level);
    
    // Check for edges and walls
    this.checkEdgesAndWalls(level);
  }

  private updateFlyingMovement(deltaTime: number): void {
    this.flyingTimer += deltaTime;
    
    // Sine wave movement
    this.flyingOffset = Math.sin(this.flyingTimer * 3) * 50;
    this.x += this.direction * this.speed * deltaTime;
    
    // Vertical bobbing
    this.y += Math.sin(this.flyingTimer * 4) * 30 * deltaTime;
  }

  private checkPlatformCollisions(level: Level): void {
    const enemyBounds = this.getBounds();
    this.isGrounded = false;

    level.platforms.forEach(platform => {
      const platformBounds = platform.getBounds();
      
      if (enemyBounds.intersects(platformBounds)) {
        const overlapX = Math.min(enemyBounds.right - platformBounds.left, platformBounds.right - enemyBounds.left);
        const overlapY = Math.min(enemyBounds.bottom - platformBounds.top, platformBounds.bottom - enemyBounds.top);

        if (overlapX < overlapY) {
          // Horizontal collision - change direction
          this.direction *= -1;
          if (enemyBounds.centerX < platformBounds.centerX) {
            this.x = platformBounds.left - this.width;
          } else {
            this.x = platformBounds.right;
          }
        } else {
          // Vertical collision
          if (enemyBounds.centerY < platformBounds.centerY) {
            this.y = platformBounds.top - this.height;
            this.velocity.y = 0;
            this.isGrounded = true;
          }
        }
      }
    });
  }

  private checkEdgesAndWalls(level: Level): void {
    // Check if enemy would fall off platform
    if (this.isGrounded) {
      const futureX = this.x + this.direction * this.width;
      const futureY = this.y + this.height + 10;
      
      let platformBelow = false;
      level.platforms.forEach(platform => {
        if (futureX >= platform.x && futureX <= platform.x + platform.width &&
            futureY >= platform.y && futureY <= platform.y + platform.height) {
          platformBelow = true;
        }
      });
      
      if (!platformBelow) {
        this.direction *= -1;
      }
    }
  }

  private updateAnimation(deltaTime: number): void {
    this.animationTimer += deltaTime;
    if (this.animationTimer >= 0.2) {
      this.animationFrame = (this.animationFrame + 1) % 2;
      this.animationTimer = 0;
    }
  }

  private checkBounds(level: Level): void {
    // Keep enemy within level bounds
    if (this.x < 0 || this.x > level.width - this.width) {
      this.direction *= -1;
    }
    
    // Remove if fallen off level
    if (this.y > level.height + 100) {
      this.health = 0;
    }
  }

  public takeDamage(): void {
    this.health--;
    if (this.health <= 0) {
      // Death animation could be added here
    }
  }

  public isAlive(): boolean {
    return this.health > 0;
  }

  public getBounds(): Rectangle {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Different colors for different enemy types
    switch (this.type) {
      case 'goomba':
        ctx.fillStyle = '#8B4513';
        break;
      case 'koopa':
        ctx.fillStyle = '#228B22';
        break;
      case 'spiky':
        ctx.fillStyle = '#DC143C';
        break;
      case 'flying':
        ctx.fillStyle = '#9370DB';
        break;
    }

    // Main body
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Type-specific details
    switch (this.type) {
      case 'goomba':
        this.renderGoomba(ctx);
        break;
      case 'koopa':
        this.renderKoopa(ctx);
        break;
      case 'spiky':
        this.renderSpiky(ctx);
        break;
      case 'flying':
        this.renderFlying(ctx);
        break;
    }

    ctx.restore();
  }

  private renderGoomba(ctx: CanvasRenderingContext2D): void {
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(this.x + 4, this.y + 6, 4, 4);
    ctx.fillRect(this.x + 16, this.y + 6, 4, 4);
    
    // Pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x + 6, this.y + 8, 2, 2);
    ctx.fillRect(this.x + 18, this.y + 8, 2, 2);
    
    // Frown
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x + 8, this.y + 16, 8, 2);
  }

  private renderKoopa(ctx: CanvasRenderingContext2D): void {
    // Shell pattern
    ctx.fillStyle = '#006400';
    ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
    
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(this.x + 6, this.y + 8, 3, 3);
    ctx.fillRect(this.x + 19, this.y + 8, 3, 3);
  }

  private renderSpiky(ctx: CanvasRenderingContext2D): void {
    // Spikes
    ctx.fillStyle = '#8B0000';
    for (let i = 0; i < this.width; i += 4) {
      ctx.fillRect(this.x + i, this.y - 4, 2, 4);
      ctx.fillRect(this.x + i, this.y + this.height, 2, 4);
    }
    
    // Eyes
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(this.x + 6, this.y + 8, 3, 3);
    ctx.fillRect(this.x + 17, this.y + 8, 3, 3);
  }

  private renderFlying(ctx: CanvasRenderingContext2D): void {
    // Wings
    ctx.fillStyle = '#DDA0DD';
    const wingFlap = this.animationFrame === 0 ? -2 : 2;
    ctx.fillRect(this.x - 4, this.y + 4 + wingFlap, 8, 12);
    ctx.fillRect(this.x + this.width - 4, this.y + 4 + wingFlap, 8, 12);
    
    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(this.x + 8, this.y + 6, 3, 3);
    ctx.fillRect(this.x + 19, this.y + 6, 3, 3);
  }
}