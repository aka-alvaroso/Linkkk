'use client';

import React from 'react';
import * as motion from 'motion/react-client';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
}

const DEFAULT_PRESETS = [
  '#1B1B1B', // Dark
  '#F2F3F4', // Light
  '#72d763', // Primary green
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#EF4444', // Red
];

export default function ColorPicker({
  label,
  value,
  onChange,
  presets = DEFAULT_PRESETS,
}: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <motion.label
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.4, ease: "backInOut" }}
        className="text-sm font-medium text-dark/70">
        {label}
      </motion.label>
      <div className="flex items-center gap-2">
        {/* Native color input */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.4, ease: "backInOut" }}
          className="relative"
        >
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded-xl border border-dark/10 cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-[10px] [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:rounded-[10px] [&::-moz-color-swatch]:border-none"
          />
        </motion.div>

        {/* Hex input */}
        <motion.input
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
          type="text"
          value={value.toUpperCase()}
          onChange={(e) => {
            const val = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
              onChange(val);
            }
          }}
          onBlur={(e) => {
            // Ensure valid hex on blur
            const val = e.target.value;
            if (!/^#[0-9A-Fa-f]{6}$/.test(val)) {
              onChange('#000000');
            }
          }}
          className="w-24 px-3 py-2 text-sm font-mono rounded-xl border border-dark/10 bg-light focus:outline-none focus:ring-1 focus:ring-primary/50"
          placeholder="#000000"
        />

        {/* Preset colors */}
        <div className="flex gap-1 flex-wrap">
          {presets.map((preset, i) => (
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.025 * i, duration: 0.3, ease: "backInOut" }}
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`w-6 h-6 rounded-lg border-2 transition-all ${value.toUpperCase() === preset.toUpperCase()
                ? 'border-primary scale-110'
                : 'border-dark/10 hover:border-dark/30'
                }`}
              style={{ backgroundColor: preset }}
              title={preset}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
