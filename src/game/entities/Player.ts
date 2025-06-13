import { InputManager } from '../InputManager';
import { Level } from '../Level';
import { Rectangle } from '../utils/Rectangle';
import { Vector2 } from '../utils/Vector2';

export type PowerUpType = 'speed' | 'jump' | 'size' | 'invincible';

export class Player {
  public x: number;
  public y: number;
  public velocity: Vector2;
  public width = 32;
  public height = 48;
  
  private speed = 200;
  private jumpPower = 400;
  private gravity = 1200;
  private friction = 0.8;
  private maxSpeed = 300;
  
  private isGrounded = false;
  private isRunning = false;
  private facingRight = true;
  private invulnerabilityTimer = 0;
  
  private animationFrame = 0;
  private animationTimer = 0;
  private animationSpeed = 0.1;
  
  // Power-up effects
  private powerUpTimers: Map<PowerUpType, number> = new Map();
  private basePowerValues: Map<string, number> = new Map();

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.velocity = new Vector2(0, 0);
    
    // Store base values for power-up restoration
    this.basePowerValues.set('speed', this.speed);
    this.basePowerValues.set('jumpPower', this.jumpPower);
    this.basePowerValues.set('maxSpeed', this.maxSpeed);
  }

  update(deltaTime: number, input: InputManager, level: Level): void {
    this.handleInput(input, deltaTime);
    this.updatePhysics(deltaTime, level);
    this.updatePowerUps(deltaTime);
    this.updateAnimation(deltaTime);
    this.updateInvulnerability(deltaTime);
  }

  private handleInput(input: InputManager, deltaTime: number): void {
    // Horizontal movement
    if (input.isPressed('left') || input.isPressed('a')) {
      this.velocity.x -= this.speed * deltaTime;
      this.facingRight = false;
      this.isRunning = true;
    } else if (input.isPressed('right') || input.isPressed('d')) {
      this.velocity.x += this.speed * deltaTime;
      this.facingRight = true;
      this.isRunning = true;
    } else {
      this.isRunning = false;
    }

    // Running (shift key)
    const runMultiplier = (input.isPressed('shift') && this.isRunning) ? 1.5 : 1;
    this.velocity.x *= runMultiplier;

    // Jumping
    if ((input.isPressed('space') || input.isPressed('up') || input.isPressed('w')) && this.isGrounded) {
      this.velocity.y = -this.jumpPower;
      this.isGrounded = false;
    }

    // Apply friction and speed limits
    this.velocity.x *= this.friction;
    this.velocity.x = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.velocity.x));
  }

  private updatePhysics(deltaTime: number, level: Level): void {
    // Apply gravity
    this.velocity.y += this.gravity * deltaTime;

    // Update position
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;

    // Check collisions with platforms
    this.checkPlatformCollisions(level);

    // Keep player in bounds
    this.x = Math.max(0, Math.min(level.width - this.width, this.x));
    
    // Check if player fell off the level
    if (this.y > level.height + 100) {
      this.respawn();
    }
  }

  private checkPlatformCollisions(level: Level): void {
    const playerBounds = this.getBounds();
    this.isGrounded = false;

    level.platforms.forEach(platform => {
      const platformBounds = platform.getBounds();
      
      if (playerBounds.intersects(platformBounds)) {
        // Calculate overlap
        const overlapX = Math.min(playerBounds.right - platformBounds.left, platformBounds.right - playerBounds.left);
        const overlapY = Math.min(playerBounds.bottom - platformBounds.top, platformBounds.bottom - playerBounds.top);

        // Resolve collision based on smallest overlap
        if (overlapX < overlapY) {
          // Horizontal collision
          if (playerBounds.centerX < platformBounds.centerX) {
            this.x = platformBounds.left - this.width;
          } else {
            this.x = platformBounds.right;
          }
          this.velocity.x = 0;
        } else {
          // Vertical collision
          if (playerBounds.centerY < platformBounds.centerY) {
            // Player is above platform
            this.y = platformBounds.top - this.height;
            this.velocity.y = 0;
            this.isGrounded = true;
          } else {
            // Player is below platform
            this.y = platformBounds.bottom;
            this.velocity.y = 0;
          }
        }
      }
    });
  }

  private updatePowerUps(deltaTime: number): void {
    // Update power-up timers
    this.powerUpTimers.forEach((timer, type) => {
      const newTimer = timer - deltaTime;
      if (newTimer <= 0) {
        this.removePowerUp(type);
        this.powerUpTimers.delete(type);
      } else {
        this.powerUpTimers.set(type, newTimer);
      }
    });
  }

  private updateAnimation(deltaTime: number): void {
    if (this.isRunning && this.isGrounded) {
      this.animationTimer += deltaTime;
      if (this.animationTimer >= this.animationSpeed) {
        this.animationFrame = (this.animationFrame + 1) % 4;
        this.animationTimer = 0;
      }
    } else {
      this.animationFrame = 0;
    }
  }

  private updateInvulnerability(deltaTime: number): void {
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer -= deltaTime;
    }
  }

  public applyPowerUp(type: PowerUpType): void {
    this.powerUpTimers.set(type, 10); // 10 seconds duration

    switch (type) {
      case 'speed':
        this.speed = this.basePowerValues.get('speed')! * 1.5;
        this.maxSpeed = this.basePowerValues.get('maxSpeed')! * 1.5;
        break;
      case 'jump':
        this.jumpPower = this.basePowerValues.get('jumpPower')! * 1.3;
        break;
      case 'size':
        this.width = 24;
        this.height = 36;
        break;
      case 'invincible':
        this.invulnerabilityTimer = 10;
        break;
    }
  }

  private removePowerUp(type: PowerUpType): void {
    switch (type) {
      case 'speed':
        this.speed = this.basePowerValues.get('speed')!;
        this.maxSpeed = this.basePowerValues.get('maxSpeed')!;
        break;
      case 'jump':
        this.jumpPower = this.basePowerValues.get('jumpPower')!;
        break;
      case 'size':
        this.width = 32;
        this.height = 48;
        break;
    }
  }

  public takeDamage(): void {
    if (!this.isInvulnerable()) {
      this.invulnerabilityTimer = 2;
      // Knockback effect
      this.velocity.x = this.facingRight ? -200 : 200;
      this.velocity.y = -150;
    }
  }

  public bounce(): void {
    this.velocity.y = -200;
  }

  public isInvulnerable(): boolean {
    return this.invulnerabilityTimer > 0 || this.powerUpTimers.has('invincible');
  }

  public respawn(): void {
    this.x = 100;
    this.y = 400;
    this.velocity.set(0, 0);
  }

  public getBounds(): Rectangle {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Apply invulnerability flashing effect
    if (this.isInvulnerable() && Math.floor(Date.now() / 100) % 2) {
      ctx.globalAlpha = 0.5;
    }

    // Power-up visual effects
    if (this.powerUpTimers.has('speed')) {
      ctx.shadowColor = '#00ff00';
      ctx.shadowBlur = 10;
    }
    if (this.powerUpTimers.has('jump')) {
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 10;
    }
    if (this.powerUpTimers.has('invincible')) {
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 15;
    }

    // Draw player rectangle (will be replaced with sprites)
    ctx.fillStyle = this.powerUpTimers.has('invincible') ? '#ff00ff' : '#3b82f6';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Draw face direction indicator
    ctx.fillStyle = '#ffffff';
    const eyeSize = 4;
    const eyeY = this.y + 12;
    
    if (this.facingRight) {
      ctx.fillRect(this.x + 20, eyeY, eyeSize, eyeSize);
      ctx.fillRect(this.x + 20, eyeY + 8, eyeSize, eyeSize);
    } else {
      ctx.fillRect(this.x + 8, eyeY, eyeSize, eyeSize);
      ctx.fillRect(this.x + 8, eyeY + 8, eyeSize, eyeSize);
    }

    // Draw power-up indicators
    let indicatorY = this.y - 20;
    this.powerUpTimers.forEach((timer, type) => {
      ctx.fillStyle = this.getPowerUpColor(type);
      ctx.fillRect(this.x, indicatorY, this.width, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(this.x, indicatorY, (timer / 10) * this.width, 4);
      indicatorY -= 8;
    });

    ctx.restore();
  }

  private getPowerUpColor(type: PowerUpType): string {
    switch (type) {
      case 'speed': return '#00ff00';
      case 'jump': return '#ffff00';
      case 'size': return '#ff8800';
      case 'invincible': return '#ff00ff';
      default: return '#ffffff';
    }
  }
}