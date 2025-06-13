import { Platform } from './entities/Platform';
import { Enemy } from './entities/Enemy';
import { Collectible } from './entities/Collectible';
import { PowerUp } from './entities/PowerUp';
import { Player } from './entities/Player';

export class Level {
  public width: number;
  public height: number;
  public platforms: Platform[] = [];
  public enemies: Enemy[] = [];
  public collectibles: Collectible[] = [];
  public powerUps: PowerUp[] = [];
  
  private levelNumber: number;
  private backgroundGradient: string[] = [];

  constructor(levelNumber: number) {
    this.levelNumber = levelNumber;
    this.width = 2048;
    this.height = 576;
    
    this.generateLevel();
    this.setBackgroundTheme();
  }

  private generateLevel(): void {
    // Clear existing entities
    this.platforms = [];
    this.enemies = [];
    this.collectibles = [];
    this.powerUps = [];

    // Generate platforms based on level
    this.generatePlatforms();
    this.generateEnemies();
    this.generateCollectibles();
    this.generatePowerUps();
  }

  private generatePlatforms(): void {
    // Ground platforms
    for (let x = 0; x < this.width; x += 128) {
      this.platforms.push(new Platform(x, this.height - 64, 128, 64, 'ground'));
    }

    // Level-specific platform generation
    const difficulty = Math.min(this.levelNumber, 5);
    const platformCount = 8 + difficulty * 2;

    for (let i = 0; i < platformCount; i++) {
      const x = 200 + (i * (this.width - 400)) / platformCount;
      const y = 200 + Math.sin(i * 0.5) * 100 + Math.random() * 100;
      const width = 96 + Math.random() * 64;
      const height = 24;
      
      this.platforms.push(new Platform(x, y, width, height, 'floating'));
    }

    // Add some moving platforms for higher levels
    if (this.levelNumber >= 3) {
      for (let i = 0; i < 2; i++) {
        const x = 600 + i * 400;
        const y = 300 + i * 50;
        this.platforms.push(new Platform(x, y, 128, 24, 'moving'));
      }
    }
  }

  private generateEnemies(): void {
    const enemyCount = 3 + this.levelNumber;
    
    for (let i = 0; i < enemyCount; i++) {
      const x = 300 + (i * (this.width - 600)) / enemyCount;
      const y = this.height - 128;
      
      // Different enemy types based on level
      const types = ['goomba', 'koopa'];
      if (this.levelNumber >= 2) types.push('spiky');
      if (this.levelNumber >= 4) types.push('flying');
      
      const type = types[Math.floor(Math.random() * types.length)];
      this.enemies.push(new Enemy(x, y, type as any));
    }
  }

  private generateCollectibles(): void {
    const collectibleCount = 15 + this.levelNumber * 3;
    
    for (let i = 0; i < collectibleCount; i++) {
      const x = 150 + Math.random() * (this.width - 300);
      const y = 100 + Math.random() * (this.height - 200);
      
      // Check if position is valid (not inside platform)
      const isValidPosition = !this.platforms.some(platform => 
        x >= platform.x && x <= platform.x + platform.width &&
        y >= platform.y && y <= platform.y + platform.height
      );
      
      if (isValidPosition) {
        const type = Math.random() < 0.7 ? 'coin' : 'gem';
        this.collectibles.push(new Collectible(x, y, type as any));
      }
    }
  }

  private generatePowerUps(): void {
    const powerUpCount = 2 + Math.floor(this.levelNumber / 2);
    
    for (let i = 0; i < powerUpCount; i++) {
      const x = 400 + (i * (this.width - 800)) / powerUpCount;
      const y = 200 + Math.random() * 200;
      
      const types = ['speed', 'jump', 'size', 'invincible'];
      const type = types[Math.floor(Math.random() * types.length)];
      this.powerUps.push(new PowerUp(x, y, type as any));
    }
  }

  private setBackgroundTheme(): void {
    // Different themes for different levels
    const themes = [
      ['#87CEEB', '#98FB98'], // Sky blue to light green
      ['#FF6B6B', '#FFE66D'], // Red to yellow
      ['#4ECDC4', '#44A08D'], // Teal to dark teal
      ['#A8E6CF', '#7FCDCD'], // Light green to cyan
      ['#FFD93D', '#FF6B6B'], // Yellow to red
    ];
    
    this.backgroundGradient = themes[this.levelNumber % themes.length];
  }

  public update(deltaTime: number, player: Player): void {
    // Update enemies
    this.enemies = this.enemies.filter(enemy => {
      enemy.update(deltaTime, this);
      return enemy.isAlive();
    });

    // Update moving platforms
    this.platforms.forEach(platform => {
      platform.update(deltaTime);
    });

    // Update collectibles (spinning animation)
    this.collectibles.forEach(collectible => {
      collectible.update(deltaTime);
    });

    // Update power-ups
    this.powerUps.forEach(powerUp => {
      powerUp.update(deltaTime);
    });
  }

  public renderBackground(ctx: CanvasRenderingContext2D): void {
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, this.backgroundGradient[0]);
    gradient.addColorStop(1, this.backgroundGradient[1]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Add clouds or background elements
    this.renderClouds(ctx);
  }

  private renderClouds(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    
    // Static clouds based on level seed
    for (let i = 0; i < 5; i++) {
      const x = (i * this.width / 5) + (this.levelNumber * 50) % 200;
      const y = 50 + (i * 30) % 100;
      
      // Simple cloud shape
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
      ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
      ctx.arc(x + 25, y - 25, 25, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  public renderPlatforms(ctx: CanvasRenderingContext2D): void {
    this.platforms.forEach(platform => platform.render(ctx));
  }

  public renderForeground(ctx: CanvasRenderingContext2D): void {
    // Render any foreground elements like grass, decorations, etc.
    this.renderGrass(ctx);
  }

  private renderGrass(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#4CAF50';
    
    // Grass on top of ground platforms
    this.platforms.forEach(platform => {
      if (platform.type === 'ground') {
        for (let x = platform.x; x < platform.x + platform.width; x += 8) {
          const grassHeight = 8 + Math.random() * 8;
          ctx.fillRect(x, platform.y - grassHeight, 2, grassHeight);
        }
      }
    });
  }
}