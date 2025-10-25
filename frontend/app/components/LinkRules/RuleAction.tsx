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
  label?: string;
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
  onChange,
  label = 'Then'
}: RuleActionProps) {
  const handleTypeChange = (newType: string | number | null) => {
    const type = newType as ActionType;

    // Don't trigger change if it's the same type
    if (type === actionType) return;

    // Set default settings based on action type
    let defaultSettings: ActionSettings;
    switch (type) {
      case 'redirect':
        defaultSettings = { url: '' } as RedirectSettings;
        break;
      case 'block_access':
        defaultSettings = { message: '' } as BlockAccessSettings;
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
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-2">
              Redirect URL
            </label>
            <Input
              placeholder="https://example.com or {{longUrl}}"
              value={redirectSettings.url || ''}
              onChange={(e) => handleSettingChange('url', e.target.value)}
              size="md"
              rounded="2xl"
              className='bg-light border-none outline-none'
            />
            <p className="mt-1 text-xs text-dark/50">
              Use placeholders: {'{'}{'{'} longUrl {'}'}{'}'}, {'{'}{'{'} shortUrl {'}'}{'}'}</p>
          </div>
        );

      case 'block_access':
        const blockSettings = actionSettings as BlockAccessSettings;
        return (
          <div>
            <label className="block text-sm font-medium text-dark/70 mb-2">
              Block Message (optional)
            </label>
            <Input
              placeholder="Access to this link is not allowed"
              value={blockSettings.message || ''}
              onChange={(e) => handleSettingChange('message', e.target.value)}
              size="md"
              rounded="2xl"
              className='bg-light border-none outline-none'
            />
          </div>
        );

      case 'password_gate':
        const passwordSettings = actionSettings as PasswordGateSettings;
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter password"
                value={passwordSettings.passwordHash || ''}
                onChange={(e) => handleSettingChange('passwordHash', e.target.value)}
                size="md"
                rounded="2xl"
                className='bg-light border-none outline-none'
              />
              <p className="mt-1 text-xs text-dark/50">Will be hashed before saving</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2">
                Hint (optional)
              </label>
              <Input
                placeholder="Hint for users"
                value={passwordSettings.hint || ''}
                onChange={(e) => handleSettingChange('hint', e.target.value)}
                size="md"
                rounded="2xl"
                className='bg-light border-none outline-none'
              />
            </div>
          </div>
        );

      case 'notify':
        const notifySettings = actionSettings as NotifySettings;
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2">
                Webhook URL (optional)
              </label>
              <Input
                placeholder="https://hooks.example.com/webhook"
                value={notifySettings.webhookUrl || ''}
                onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
                size="md"
                rounded="2xl"
                className='bg-light border-none outline-none'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2">
                Message (optional)
              </label>
              <Input
                placeholder="Custom notification message"
                value={notifySettings.message || ''}
                onChange={(e) => handleSettingChange('message', e.target.value)}
                size="md"
                rounded="2xl"
                className='bg-light border-none outline-none'
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 rounded-2xl">
      {/* Label */}
      <div className="text-sm font-black text-dark uppercase tracking-wide">
        {label}
      </div>

      {/* Action Type Select */}
      <div>
        <label className="block text-sm font-medium text-dark/70 mb-1">
          Action Type
        </label>
        <Select
          options={ACTION_TYPE_OPTIONS}
          value={actionType}
          onChange={handleTypeChange}
          buttonClassName="w-auto rounded-2xl text-sm border-none bg-light p-2"
          listClassName="rounded-2xl w-auto shadow-none"
          optionClassName='rounded-2xl p-2'
        />
      </div>

      {/* Dynamic Settings */}
      {renderSettings()}
    </div>
  );
}
