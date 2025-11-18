/**
 * RuleAction Component
 * Displays and edits a rule action (type + settings)
 */

import React from 'react';
import Select from '../ui/Select/Select';
import Input from '../ui/Input/Input';
import {
  ActionType,
  ActionSettings,
  RedirectSettings,
  BlockAccessSettings,
  PasswordGateSettings,
  NotifySettings
} from '@/app/types/linkRules';

interface RuleActionProps {
  actionType: ActionType;
  actionSettings: ActionSettings;
  onChange: (actionType: ActionType, actionSettings: ActionSettings) => void;
}

// Action type options
const ACTION_TYPE_OPTIONS = [
  { label: 'Redirect', value: 'redirect' },
  { label: 'Block Access', value: 'block_access' },
  { label: 'Password Gate', value: 'password_gate' },
  { label: 'Notify', value: 'notify' },
];

export function RuleAction({
  actionType,
  actionSettings,
  onChange
}: RuleActionProps) {
  const handleTypeChange = (newType: React.SetStateAction<string | number | null>) => {
    // Handle both direct values and functions (SetStateAction)
    const resolvedType = typeof newType === 'function'
      ? newType(actionType)
      : newType;

    const type = resolvedType as ActionType;

    // Don't trigger change if it's the same type
    if (type === actionType) return;

    // Set default settings based on action type
    let defaultSettings: ActionSettings;
    switch (type) {
      case 'redirect':
        defaultSettings = { url: '' } as RedirectSettings;
        break;
      case 'block_access':
        defaultSettings = { reason: '' } as BlockAccessSettings;
        break;
      case 'password_gate':
        defaultSettings = { passwordHash: '', hint: '' } as PasswordGateSettings;
        break;
      case 'notify':
        defaultSettings = { webhookUrl: '', message: '' } as NotifySettings;
        break;
    }

    onChange(type, defaultSettings);
  };

  const handleSettingChange = (key: string, value: any) => {
    onChange(actionType, { ...actionSettings, [key]: value });
  };

  // Render settings inputs based on action type
  const renderSettings = () => {
    switch (actionType) {
      case 'redirect':
        const redirectSettings = actionSettings as RedirectSettings;
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark/50">to</span>
            <Input
              placeholder="https://example.com or {{longUrl}}"
              value={redirectSettings.url || ''}
              onChange={(e) => handleSettingChange('url', e.target.value)}
              size="sm"
              rounded="lg"
              className='bg-light border border-dark/10 px-2 py-1 rounded-lg hover:border-dark/20'
            />
          </div>
        );

      case 'block_access':
        const blockSettings = actionSettings as BlockAccessSettings;
        return (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Block reason (optional)"
              value={blockSettings.reason || ''}
              onChange={(e) => handleSettingChange('reason', e.target.value)}
              size="sm"
              rounded="lg"
              className='bg-light border border-dark/10 px-2 py-1 rounded-lg hover:border-dark/20'
            />
          </div>
        );

      case 'password_gate':
        const passwordSettings = actionSettings as PasswordGateSettings;
        return (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Password"
              value={passwordSettings.passwordHash || ''}
              onChange={(e) => handleSettingChange('passwordHash', e.target.value)}
              size="sm"
              rounded="lg"
              className='bg-light border border-dark/10 px-2 py-1 rounded-lg hover:border-dark/20'
            />
            <Input
              placeholder="Hint (optional)"
              value={passwordSettings.hint || ''}
              onChange={(e) => handleSettingChange('hint', e.target.value)}
              size="sm"
              rounded="lg"
              className='bg-light border border-dark/10 px-2 py-1 rounded-lg hover:border-dark/20'
            />
          </div>
        );

      case 'notify':
        const notifySettings = actionSettings as NotifySettings;
        return (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Webhook URL (optional)"
              value={notifySettings.webhookUrl || ''}
              onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
              size="sm"
              rounded="lg"
              className='bg-light border border-dark/10 px-2 py-1 rounded-lg hover:border-dark/20'
            />
            <Input
              placeholder="Message (optional)"
              value={notifySettings.message || ''}
              onChange={(e) => handleSettingChange('message', e.target.value)}
              size="sm"
              rounded="lg"
              className='bg-light border border-dark/10 px-2 py-1 rounded-lg hover:border-dark/20'
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select
        options={ACTION_TYPE_OPTIONS}
        value={actionType}
        onChange={handleTypeChange}
        className='w-auto text-sm'
        buttonClassName="w-auto rounded-lg text-sm border border-dark/10 bg-light px-2 py-1 hover:border-dark/20 whitespace-nowrap"
        listClassName="rounded-lg w-auto shadow-lg bottom-full mb-1"
        optionClassName='rounded-md p-1.5 text-sm'
      />
      {/* Dynamic Settings inline */}
      {renderSettings()}
    </div>
  );
}
