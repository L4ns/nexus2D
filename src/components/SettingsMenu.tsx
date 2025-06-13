import React from 'react';
import { ArrowLeft, Monitor, Volume2, Gamepad2, Zap } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { PlatformInfo } from '../contexts/PlatformContext';

interface SettingsMenuProps {
  onBack: () => void;
  platform: PlatformInfo;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onBack, platform }) => {
  const { settings, updateSettings, resetSettings } = useSettings();

  const SliderInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
  }> = ({ label, value, onChange, min = 0, max = 1, step = 0.1 }) => (
    <div className="space-y-2">
      <div className="flex justify-between text-white text-sm">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  const ToggleSwitch: React.FC<{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
  }> = ({ label, checked, onChange, disabled = false }) => (
    <div className="flex justify-between items-center">
      <span className={`text-white text-sm ${disabled ? 'opacity-50' : ''}`}>{label}</span>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectInput: React.FC<{
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }> = ({ label, value, options, onChange }) => (
    <div className="space-y-2">
      <span className="text-white text-sm">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl max-w-md w-full max-h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="text-white hover:text-blue-400 transition-colors mr-3"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
        </div>

        <div className="space-y-6">
          {/* Graphics Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white font-semibold">
              <Monitor size={20} />
              <span>Graphics</span>
            </div>
            
            <SelectInput
              label="Resolution"
              value={settings.graphics.resolution}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'low', label: 'Low (720p)' },
                { value: 'medium', label: 'Medium (1080p)' },
                { value: 'high', label: 'High (1440p)' },
              ]}
              onChange={(value) => updateSettings({
                graphics: { ...settings.graphics, resolution: value as any }
              })}
            />

            <SelectInput
              label="Target FPS"
              value={settings.graphics.targetFPS.toString()}
              options={[
                { value: '30', label: '30 FPS (Battery Saver)' },
                { value: '60', label: '60 FPS (Smooth)' },
              ]}
              onChange={(value) => updateSettings({
                graphics: { ...settings.graphics, targetFPS: parseInt(value) as any }
              })}
            />

            <ToggleSwitch
              label="Particle Effects"
              checked={settings.graphics.particleEffects}
              onChange={(checked) => updateSettings({
                graphics: { ...settings.graphics, particleEffects: checked }
              })}
            />

            <ToggleSwitch
              label="Shadows"
              checked={settings.graphics.shadows}
              onChange={(checked) => updateSettings({
                graphics: { ...settings.graphics, shadows: checked }
              })}
            />

            <ToggleSwitch
              label="Anti-Aliasing"
              checked={settings.graphics.antiAliasing}
              onChange={(checked) => updateSettings({
                graphics: { ...settings.graphics, antiAliasing: checked }
              })}
            />
          </div>

          {/* Audio Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white font-semibold">
              <Volume2 size={20} />
              <span>Audio</span>
            </div>

            <SliderInput
              label="Master Volume"
              value={settings.audio.masterVolume}
              onChange={(value) => updateSettings({
                audio: { ...settings.audio, masterVolume: value }
              })}
            />

            <SliderInput
              label="Music Volume"
              value={settings.audio.musicVolume}
              onChange={(value) => updateSettings({
                audio: { ...settings.audio, musicVolume: value }
              })}
            />

            <SliderInput
              label="Sound Effects"
              value={settings.audio.sfxVolume}
              onChange={(value) => updateSettings({
                audio: { ...settings.audio, sfxVolume: value }
              })}
            />
          </div>

          {/* Controls Settings */}
          {(platform.isMobile || platform.hasTouch) && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <Gamepad2 size={20} />
                <span>Touch Controls</span>
              </div>

              <SliderInput
                label="Touch Sensitivity"
                value={settings.controls.touchSensitivity}
                onChange={(value) => updateSettings({
                  controls: { ...settings.controls, touchSensitivity: value }
                })}
                min={0.5}
                max={2}
              />

              <SliderInput
                label="Virtual Joystick Size"
                value={settings.controls.virtualJoystickSize}
                onChange={(value) => updateSettings({
                  controls: { ...settings.controls, virtualJoystickSize: value }
                })}
                min={0.7}
                max={1.5}
              />

              <SliderInput
                label="Button Size"
                value={settings.controls.buttonSize}
                onChange={(value) => updateSettings({
                  controls: { ...settings.controls, buttonSize: value }
                })}
                min={0.7}
                max={1.5}
              />

              <ToggleSwitch
                label="Haptic Feedback"
                checked={settings.controls.hapticFeedback}
                onChange={(checked) => updateSettings({
                  controls: { ...settings.controls, hapticFeedback: checked }
                })}
                disabled={!platform.supportsHaptics}
              />
            </div>
          )}

          {/* Desktop Controls */}
          {platform.isDesktop && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <Gamepad2 size={20} />
                <span>Controls</span>
              </div>

              <SelectInput
                label="Keyboard Layout"
                value={settings.controls.keyboardLayout}
                options={[
                  { value: 'wasd', label: 'WASD' },
                  { value: 'arrows', label: 'Arrow Keys' },
                ]}
                onChange={(value) => updateSettings({
                  controls: { ...settings.controls, keyboardLayout: value as any }
                })}
              />
            </div>
          )}

          {/* Gameplay Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white font-semibold">
              <Zap size={20} />
              <span>Gameplay</span>
            </div>

            <SelectInput
              label="Difficulty"
              value={settings.gameplay.difficulty}
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'normal', label: 'Normal' },
                { value: 'hard', label: 'Hard' },
              ]}
              onChange={(value) => updateSettings({
                gameplay: { ...settings.gameplay, difficulty: value as any }
              })}
            />

            <ToggleSwitch
              label="Auto Save"
              checked={settings.gameplay.autoSave}
              onChange={(checked) => updateSettings({
                gameplay: { ...settings.gameplay, autoSave: checked }
              })}
            />

            <ToggleSwitch
              label="Show Tutorials"
              checked={settings.gameplay.showTutorials}
              onChange={(checked) => updateSettings({
                gameplay: { ...settings.gameplay, showTutorials: checked }
              })}
            />

            <ToggleSwitch
              label="Pause on Focus Loss"
              checked={settings.gameplay.pauseOnFocusLoss}
              onChange={(checked) => updateSettings({
                gameplay: { ...settings.gameplay, pauseOnFocusLoss: checked }
              })}
            />
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-gray-600">
            <button
              onClick={resetSettings}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;