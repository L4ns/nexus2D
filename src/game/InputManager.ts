import { PlatformInfo } from '../contexts/PlatformContext';

export class InputManager {
  private keys: Set<string> = new Set();
  private previousKeys: Set<string> = new Set();
  private platform: PlatformInfo;
  private gamepadIndex: number = -1;

  constructor(platform: PlatformInfo) {
    this.platform = platform;
    this.bindEvents();
    this.detectGamepad();
  }

  private bindEvents(): void {
    // Keyboard events
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Prevent default behavior for game keys
    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    // Gamepad events (if supported)
    if (this.platform.supportsGamepad) {
      window.addEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
      window.addEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
    }

    // Touch events for mobile (basic support)
    if (this.platform.hasTouch) {
      this.bindTouchEvents();
    }
  }

  private bindTouchEvents(): void {
    // Basic touch support for emergency controls
    let touchStartX = 0;
    let touchStartY = 0;

    window.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Simple swipe detection
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
              this.simulateKeyPress('right');
            } else {
              this.simulateKeyPress('left');
            }
          }
        } else {
          if (Math.abs(deltaY) > 50) {
            if (deltaY < 0) {
              this.simulateKeyPress('space');
            }
          }
        }
      }
    }, { passive: false });
  }

  private simulateKeyPress(key: string): void {
    this.keys.add(key);
    setTimeout(() => {
      this.keys.delete(key);
    }, 100);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = this.normalizeKey(event.code);
    this.keys.add(key);
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = this.normalizeKey(event.code);
    this.keys.delete(key);
  }

  private handleGamepadConnected(event: GamepadEvent): void {
    this.gamepadIndex = event.gamepad.index;
    console.log('Gamepad connected:', event.gamepad.id);
  }

  private handleGamepadDisconnected(event: GamepadEvent): void {
    if (this.gamepadIndex === event.gamepad.index) {
      this.gamepadIndex = -1;
    }
    console.log('Gamepad disconnected');
  }

  private detectGamepad(): void {
    if (!this.platform.supportsGamepad) return;

    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        this.gamepadIndex = i;
        break;
      }
    }
  }

  private updateGamepadInput(): void {
    if (this.gamepadIndex === -1 || !this.platform.supportsGamepad) return;

    const gamepad = navigator.getGamepads()[this.gamepadIndex];
    if (!gamepad) return;

    // D-pad or left stick
    const leftStickX = gamepad.axes[0];
    const leftStickY = gamepad.axes[1];
    const deadzone = 0.3;

    // Clear previous gamepad inputs
    this.keys.delete('gamepad_left');
    this.keys.delete('gamepad_right');
    this.keys.delete('gamepad_up');
    this.keys.delete('gamepad_down');

    // Add current gamepad inputs
    if (leftStickX < -deadzone || gamepad.buttons[14]?.pressed) {
      this.keys.add('gamepad_left');
    }
    if (leftStickX > deadzone || gamepad.buttons[15]?.pressed) {
      this.keys.add('gamepad_right');
    }
    if (leftStickY < -deadzone || gamepad.buttons[12]?.pressed) {
      this.keys.add('gamepad_up');
    }
    if (leftStickY > deadzone || gamepad.buttons[13]?.pressed) {
      this.keys.add('gamepad_down');
    }

    // Action buttons
    if (gamepad.buttons[0]?.pressed) { // A button (jump)
      this.keys.add('gamepad_jump');
    } else {
      this.keys.delete('gamepad_jump');
    }

    if (gamepad.buttons[1]?.pressed || gamepad.buttons[5]?.pressed) { // B button or right bumper (run)
      this.keys.add('gamepad_run');
    } else {
      this.keys.delete('gamepad_run');
    }
  }

  private normalizeKey(code: string): string {
    const keyMap: { [key: string]: string } = {
      'KeyW': 'w',
      'KeyA': 'a',
      'KeyS': 's',
      'KeyD': 'd',
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'Space': 'space',
      'ShiftLeft': 'shift',
      'ShiftRight': 'shift',
      'Enter': 'enter',
      'Escape': 'escape'
    };
    
    return keyMap[code] || code.toLowerCase();
  }

  public update(): void {
    this.previousKeys = new Set(this.keys);
    this.updateGamepadInput();
  }

  public isPressed(key: string): boolean {
    // Check for gamepad alternatives
    switch (key) {
      case 'left':
      case 'a':
        return this.keys.has(key) || this.keys.has('gamepad_left');
      case 'right':
      case 'd':
        return this.keys.has(key) || this.keys.has('gamepad_right');
      case 'up':
      case 'w':
        return this.keys.has(key) || this.keys.has('gamepad_up');
      case 'down':
      case 's':
        return this.keys.has(key) || this.keys.has('gamepad_down');
      case 'space':
        return this.keys.has(key) || this.keys.has('gamepad_jump');
      case 'shift':
        return this.keys.has(key) || this.keys.has('gamepad_run');
      default:
        return this.keys.has(key);
    }
  }

  public isJustPressed(key: string): boolean {
    return this.isPressed(key) && !this.previousKeys.has(key);
  }

  public isJustReleased(key: string): boolean {
    return !this.isPressed(key) && this.previousKeys.has(key);
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    
    if (this.platform.supportsGamepad) {
      window.removeEventListener('gamepadconnected', this.handleGamepadConnected.bind(this));
      window.removeEventListener('gamepaddisconnected', this.handleGamepadDisconnected.bind(this));
    }
  }
}