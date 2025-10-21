import React from 'react';
import Input from '@/app/components/ui/Input/Input';
import ActionTypeSelector from '../atoms/ActionTypeSelector';
import type { ActionType, ActionSettings } from '@/app/types';
import * as motion from 'motion/react-client';

interface ActionRowProps {
  actionType: ActionType;
  actionSettings?: ActionSettings;
  onChange: (type: ActionType, settings?: ActionSettings) => void;
  label?: string;
  index?: number;
}

export default function ActionRow({ actionType, actionSettings, onChange, label, index = 0 }: ActionRowProps) {
  const handleTypeChange = (type: ActionType) => {
    // Reset settings when type changes
    onChange(type, undefined);
  };

  const handleSettingsChange = (key: string, value: string) => {
    onChange(actionType, {
      ...actionSettings,
      [key]: value,
    });
  };

  const renderSettingsInputs = () => {
    switch (actionType) {
      case 'redirect':
        return (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2"
          >
            <Input
              value={(actionSettings as any)?.url || ''}
              onChange={(e) => handleSettingsChange('url', e.target.value)}
              placeholder="https://example.com (supports {{longUrl}}, {{shortUrl}})"
              size="md"
              rounded="xl"
            />
          </motion.div>
        );

      case 'block_access':
        return (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-2"
          >
            <Input
              value={(actionSettings as any)?.reason || ''}
              onChange={(e) => handleSettingsChange('reason', e.target.value)}
              placeholder="Reason (optional)"
              size="md"
              rounded="xl"
            />
            <Input
              value={(actionSettings as any)?.message || ''}
              onChange={(e) => handleSettingsChange('message', e.target.value)}
              placeholder="Custom message (optional)"
              size="md"
              rounded="xl"
            />
          </motion.div>
        );

      case 'password_gate':
        return (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-2"
          >
            <Input
              type="text"
              value={(actionSettings as any)?.passwordHash || ''}
              onChange={(e) => handleSettingsChange('passwordHash', e.target.value)}
              placeholder="Password"
              size="md"
              rounded="xl"
            />
            <Input
              value={(actionSettings as any)?.hint || ''}
              onChange={(e) => handleSettingsChange('hint', e.target.value)}
              placeholder="Password hint (optional)"
              size="md"
              rounded="xl"
            />
          </motion.div>
        );

      case 'notify':
        return (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 space-y-2"
          >
            <Input
              value={(actionSettings as any)?.webhookUrl || ''}
              onChange={(e) => handleSettingsChange('webhookUrl', e.target.value)}
              placeholder="Webhook URL (HTTPS only)"
              size="md"
              rounded="xl"
            />
            <Input
              value={(actionSettings as any)?.message || ''}
              onChange={(e) => handleSettingsChange('message', e.target.value)}
              placeholder="Custom message (optional)"
              size="md"
              rounded="xl"
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="space-y-2"
    >
      {label && (
        <p className="text-sm font-semibold text-dark/70">{label}</p>
      )}
      <ActionTypeSelector
        value={actionType}
        onChange={handleTypeChange}
      />
      {renderSettingsInputs()}
    </motion.div>
  );
}
