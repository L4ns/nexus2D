import { Player } from './entities/Player';
import { Level } from './Level';
import { InputManager } from './InputManager';
import { Camera } from './Camera';
import { ParticleSystem } from './effects/ParticleSystem';
import { AudioManager } from './AudioManager';
import { GameState } from './GameState';
import { PlatformInfo } from '../contexts/PlatformContext';
import { GameSettings } from '../contexts/SettingsContext';

export interface GameCallbacks {
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onLevelChange: (level: number) => void;
  onGameOver: () => void;
}

export interface VirtualInput {
  left?: boolean;
  right?: boolean;
  up?: boolean;
  down?: boolean;
  jump?: boolean;
  run?: boolean;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private player: Player;
  private level: Level;
  private inputManager: InputManager;
  private camera: Camera;
  private particleSystem: ParticleSystem;
  private audioManager: AudioManager;
  private gameState: GameState;
  private callbacks: GameCallbacks;
  private platform: PlatformInfo;
  private settings: GameSettings;
  
  private isRunning = false;
  private lastTime = 0;
  private animationFrameId: number | null = null;
  private virtualInput: VirtualInput = {};
  
  // Performance monitoring
  private frameCount = 0;
  private lastFPSUpdate = 0;
  private currentFPS = 0;
  private targetFrameTime: number;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks, platform: PlatformInfo, settings: GameSettings) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;
    this.platform = platform;
    this.settings = settings;
    this.targetFrameTime = 1000 / settings.graphics.targetFPS;

    // Initialize game systems
    this.gameState = new GameState();
    this.inputManager = new InputManager(platform);
    this.camera = new Camera(canvas.width, canvas.height);
    this.particleSystem = new ParticleSystem(settings);
    this.audioManager = new AudioManager(settings);
    
    // Initialize game objects
    this.level = new Level(1, platform, settings);
    this.player = new Player(100, 400, platform, settings);

    // Set up camera to follow player
    this.camera.setTarget(this.player);

    // Configure canvas for platform
    this.configureCanvas();

    // Bind methods
    this.gameLoop = this.gameLoop.bind(this);
  }

  private configureCanvas(): void {
    // Set up canvas for different platforms
    if (this.platform.isMobile) {
      // Optimize for mobile
      this.ctx.imageSmoothingEnabled = !this.settings.graphics.antiAliasing;
      this.canvas.style.touchAction = 'none';
    } else {
      // Desktop optimizations
      this.ctx.imageSmoothingEnabled = this.settings.graphics.antiAliasing;
    }

    // Set pixel ratio for crisp rendering
    const ratio = Math.min(this.platform.devicePixelRatio, 2); // Cap at 2x for performance
    this.canvas.width = this.canvas.offsetWidth * ratio;
    this.canvas.height = this.canvas.offsetHeight * ratio;
    this.ctx.scale(ratio, ratio);
  }

  public handleResize(): void {
    this.configureCanvas();
    this.camera.updateSize(this.canvas.width, this.canvas.height);
  }

  public handleVirtualInput(input: VirtualInput): void {
    this.virtualInput = { ...this.virtualInput, ...input };
  }

  start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.gameLoop();
      this.audioManager.playBackgroundMusic();
    }
  }

  pause(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.audioManager.pauseBackgroundMusic();
  }

  resume(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.gameLoop();
      this.audioManager.resumeBackgroundMusic();
    }
  }

  setMuted(muted: boolean): void {
    this.audioManager.setMuted(muted);
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.016); // Cap at 60 FPS
    
    // Frame rate limiting for mobile
    if (this.platform.isMobile && currentTime - this.lastTime < this.targetFrameTime) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
      return;
    }

    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();
    this.updatePerformanceMetrics(currentTime);

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  private updatePerformanceMetrics(currentTime: number): void {
    this.frameCount++;
    if (currentTime - this.lastFPSUpdate >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.lastFPSUpdate = currentTime;

      // Adjust quality based on performance
      if (this.platform.isMobile && this.currentFPS < this.settings.graphics.targetFPS * 0.8) {
        this.particleSystem.reduceQuality();
      }
    }
  }

  private update(deltaTime: number): void {
    // Update input (combine keyboard and virtual input)
    this.inputManager.update();
    const combinedInput = this.combineInputs();

    // Update player
    this.player.update(deltaTime, combinedInput, this.level);

    // Update level
    this.level.update(deltaTime, this.player);

    // Update camera
    this.camera.update(deltaTime);

    // Update particles
    this.particleSystem.update(deltaTime);

    // Check collisions
    this.checkCollisions();

    // Update game state
    this.updateGameState();
  }

  private combineInputs(): any {
    // Combine keyboard and virtual inputs
    return {
      isPressed: (key: string) => {
        switch (key) {
          case 'left':
          case 'a':
            return this.inputManager.isPressed(key) || this.virtualInput.left;
          case 'right':
          case 'd':
            return this.inputManager.isPressed(key) || this.virtualInput.right;
          case 'up':
          case 'w':
          case 'space':
            return this.inputManager.isPressed(key) || this.virtualInput.jump;
          case 'shift':
            return this.inputManager.isPressed(key) || this.virtualInput.run;
          default:
            return this.inputManager.isPressed(key);
        }
      }
    };
  }

  private checkCollisions(): void {
    // Player vs enemies
    this.level.enemies.forEach(enemy => {
      if (this.player.getBounds().intersects(enemy.getBounds())) {
        if (this.player.velocity.y > 0 && this.player.y < enemy.y) {
          // Player jumped on enemy
          enemy.takeDamage();
          this.player.bounce();
          this.gameState.addScore(100);
          this.particleSystem.createExplosion(enemy.x, enemy.y, '#ff6b6b');
          this.audioManager.playSound('enemyHit');
          
          // Haptic feedback for mobile
          if (this.platform.supportsHaptics) {
            this.triggerHapticFeedback('medium');
          }
        } else if (!this.player.isInvulnerable()) {
          // Player hit by enemy
          this.player.takeDamage();
          this.gameState.loseLife();
          this.audioManager.playSound('playerHit');
          this.camera.shake(10);
          
          // Strong haptic feedback for damage
          if (this.platform.supportsHaptics) {
            this.triggerHapticFeedback('heavy');
          }
        }
      }
    });

    // Player vs collectibles
    this.level.collectibles.forEach((collectible, index) => {
      if (this.player.getBounds().intersects(collectible.getBounds())) {
        this.level.collectibles.splice(index, 1);
        this.gameState.addScore(collectible.value);
        this.particleSystem.createSparkle(collectible.x, collectible.y, collectible.color);
        this.audioManager.playSound('collect');
        
        // Light haptic feedback for collectibles
        if (this.platform.supportsHaptics) {
          this.triggerHapticFeedback('light');
        }
      }
    });

    // Player vs power-ups
    this.level.powerUps.forEach((powerUp, index) => {
      if (this.player.getBounds().intersects(powerUp.getBounds())) {
        this.level.powerUps.splice(index, 1);
        this.player.applyPowerUp(powerUp.type);
        this.gameState.addScore(powerUp.value);
        this.particleSystem.createPowerUpEffect(powerUp.x, powerUp.y, powerUp.color);
        this.audioManager.playSound('powerUp');
        
        // Medium haptic feedback for power-ups
        if (this.platform.supportsHaptics) {
          this.triggerHapticFeedback('medium');
        }
      }
    });
  }

  private async triggerHapticFeedback(intensity: 'light' | 'medium' | 'heavy'): Promise<void> {
    if (this.platform.supportsHaptics && this.settings.controls.hapticFeedback) {
      try {
        const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
        let style = ImpactStyle.Light;
        
        switch (intensity) {
          case 'medium':
            style = ImpactStyle.Medium;
            break;
          case 'heavy':
            style = ImpactStyle.Heavy;
            break;
        }
        
        await Haptics.impact({ style });
      } catch (error) {
        console.warn('Haptic feedback not available');
      }
    }
  }

  private updateGameState(): void {
    // Update callbacks
    this.callbacks.onScoreChange(this.gameState.score);
    this.callbacks.onLivesChange(this.gameState.lives);
    this.callbacks.onLevelChange(this.gameState.currentLevel);

    // Check game over
    if (this.gameState.lives <= 0) {
      this.isRunning = false;
      this.callbacks.onGameOver();
    }

    // Check level completion
    if (this.player.x > this.level.width - 100) {
      this.nextLevel();
    }
  }

  private nextLevel(): void {
    this.gameState.nextLevel();
    this.level = new Level(this.gameState.currentLevel, this.platform, this.settings);
    this.player.x = 100;
    this.player.y = 400;
    this.player.velocity.x = 0;
    this.player.velocity.y = 0;
    this.audioManager.playSound('levelComplete');
    
    // Celebration haptic pattern
    if (this.platform.supportsHaptics) {
      this.triggerHapticFeedback('heavy');
      setTimeout(() => this.triggerHapticFeedback('medium'), 200);
      setTimeout(() => this.triggerHapticFeedback('light'), 400);
    }
  }

  private render(): void {
    // Clear canvas with adaptive quality
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply camera transform
    this.ctx.save();
    this.camera.apply(this.ctx);

    // Render level background
    this.level.renderBackground(this.ctx);

    // Render level platforms
    this.level.renderPlatforms(this.ctx);

    // Render enemies
    this.level.enemies.forEach(enemy => enemy.render(this.ctx));

    // Render collectibles
    this.level.collectibles.forEach(collectible => collectible.render(this.ctx));

    // Render power-ups
    this.level.powerUps.forEach(powerUp => powerUp.render(this.ctx));

    // Render player
    this.player.render(this.ctx);

    // Render particles (if enabled)
    if (this.settings.graphics.particleEffects) {
      this.particleSystem.render(this.ctx);
    }

    // Render level foreground
    this.level.renderForeground(this.ctx);

    this.ctx.restore();

    // Render debug info in development
    if (process.env.NODE_ENV === 'development') {
      this.renderDebugInfo();
    }
  }

  private renderDebugInfo(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, 10, 200, 80);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`FPS: ${this.currentFPS}`, 15, 25);
    this.ctx.fillText(`Platform: ${this.platform.platform}`, 15, 40);
    this.ctx.fillText(`Resolution: ${this.canvas.width}x${this.canvas.height}`, 15, 55);
    this.ctx.fillText(`Mobile: ${this.platform.isMobile}`, 15, 70);
    this.ctx.fillText(`Touch: ${this.platform.hasTouch}`, 15, 85);
  }

  destroy(): void {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.inputManager.destroy();
    this.audioManager.destroy();
  }
}