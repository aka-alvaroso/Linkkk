/**
 * RuleAction Component
 * Displays and edits a rule action (type + settings)
 */

import React from 'react';
import Link from 'next/link';
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
import { useTranslations } from 'next-intl';
import { TbArrowFork, TbForbid2, TbWebhook, TbLock, TbMail, TbInfoCircle } from 'react-icons/tb';

interface RuleActionProps {
  actionType: ActionType;
  actionSettings: ActionSettings;
  onChange: (actionType: ActionType, actionSettings: ActionSettings) => void;
}

export function RuleAction({
  actionType,
  actionSettings,
  onChange
}: RuleActionProps) {
  const t = useTranslations('RuleAction');

  // Action type options
  const ACTION_TYPE_OPTIONS = [
    { label: t('actionRedirect'), value: 'redirect', leftIcon: <TbArrowFork size={16} /> },
    { label: t('actionBlockAccess'), value: 'block_access', leftIcon: <TbForbid2 size={16} /> },
    { label: t('actionPasswordGate'), value: 'password_gate', leftIcon: <TbLock size={16} /> },
    { label: t('actionNotify'), value: 'notify', leftIcon: <TbWebhook size={16} /> },
  ];

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
        defaultSettings = { notifyType: 'webhook', webhookUrl: '', message: '' } as NotifySettings;
        break;
    }

    onChange(type, defaultSettings);
  };

  const handleSettingChange = (key: string, value: string | number | boolean) => {
    onChange(actionType, { ...actionSettings, [key]: value });
  };

  // Render settings inputs based on action type
  const renderSettings = () => {
    switch (actionType) {
      case 'redirect':
        const redirectSettings = actionSettings as RedirectSettings;
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark/50">{t('to')}</span>
            <Input
              placeholder={t('redirectPlaceholder')}
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
              placeholder={t('blockReasonPlaceholder')}
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
              placeholder={t('passwordPlaceholder')}
              value={passwordSettings.passwordHash || ''}
              onChange={(e) => handleSettingChange('passwordHash', e.target.value)}
              size="sm"
              rounded="lg"
              className='bg-light border border-dark/10 px-2 py-1 rounded-lg hover:border-dark/20'
            />
            <Input
              placeholder={t('hintPlaceholder')}
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
        // Derive notifyType from legacy settings for backwards compat
        const notifyType = notifySettings.notifyType
          ?? (notifySettings.sendEmail ? 'email' : 'webhook');

        const handleNotifyTypeChange = (type: 'webhook' | 'email') => {
          if (type === 'webhook') {
            onChange(actionType, {
              ...notifySettings,
              notifyType: 'webhook',
              sendEmail: false,
            } as NotifySettings);
          } else {
            onChange(actionType, {
              ...notifySettings,
              notifyType: 'email',
              webhookUrl: '',
              sendEmail: true,
            } as NotifySettings);
          }
        };

        return (
          <div className="flex items-center gap-2 flex-wrap basis-full">
            {/* Channel selector */}
            <div className="flex items-center rounded-lg border border-dark/10 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => handleNotifyTypeChange('webhook')}
                className={`flex items-center gap-1 px-2 py-1 transition-colors whitespace-nowrap ${
                  notifyType === 'webhook'
                    ? 'bg-dark text-light'
                    : 'bg-light text-dark/50 hover:text-dark/80'
                }`}
              >
                <TbWebhook size={13} />
                {t('notifyTypeWebhook')}
              </button>
              <button
                type="button"
                onClick={() => handleNotifyTypeChange('email')}
                className={`flex items-center gap-1 px-2 py-1 transition-colors whitespace-nowrap ${
                  notifyType === 'email'
                    ? 'bg-dark text-light'
                    : 'bg-light text-dark/50 hover:text-dark/80'
                }`}
              >
                <TbMail size={13} />
                {t('notifyTypeEmail')}
              </button>
            </div>

            {/* Webhook URL — only when webhook selected */}
            {notifyType === 'webhook' && (
              <Input
                placeholder={t('webhookPlaceholder')}
                value={notifySettings.webhookUrl || ''}
                onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
                size="sm"
                rounded="lg"
                className='bg-light border border-dark/10 px-2 py-1 rounded-lg hover:border-dark/20'
              />
            )}

            {/* Message — shared between both channels */}
            <Input
              placeholder={t('messagePlaceholder')}
              value={notifySettings.message || ''}
              onChange={(e) => handleSettingChange('message', e.target.value)}
              size="sm"
              rounded="lg"
              className='bg-light border border-dark/10 px-2 py-1 rounded-lg hover:border-dark/20'
            />

            {/* Query params info */}
            <Link
              href="/docs/rules#query-params"
              className="flex items-center gap-1 text-xs text-dark/40 hover:text-dark/70 whitespace-nowrap underline underline-offset-2 transition-colors"
            >
              <TbInfoCircle size={13} />
              {t('queryParamsInfo')}
            </Link>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center gap-2 flex-wrap${actionType === 'notify' ? ' basis-full' : ''}`}>
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
