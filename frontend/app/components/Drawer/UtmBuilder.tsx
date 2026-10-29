'use client';
import { useId, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { TbCopy, TbPlus, TbX } from 'react-icons/tb';
import Button from '../ui/Button/Button';
import Input from '../ui/Input/Input';
import { useToast } from '@/app/hooks/useToast';
import {
  MAX_KEY_LENGTH,
  MAX_PARAMS,
  UTM_KEYS,
  UTM_VALUE_SUGGESTIONS,
  buildParamsUrl,
  isUtmKey,
  normalizeKey,
  normalizeValue,
  rowIssue,
  type ParamRow,
} from '@/app/utils/utm';

interface UtmBuilderProps {
  /** Short URL without query string, e.g. https://linkkk.dev/r/abc123 */
  baseUrl: string;
}

const DEFAULT_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'];

/**
 * Builds a ready-to-share variant of the short URL from any number of
 * key/value params, so nobody has to type them by hand. Nothing is saved: the
 * params travel in the URL itself; the utm_* ones are recorded on each click
 * and show up under Campaigns.
 */
export default function UtmBuilder({ baseUrl }: UtmBuilderProps) {
  const t = useTranslations('EditLinkDrawer');
  const toast = useToast();
  const listId = useId();
  const nextId = useRef(0);
  const newRow = (key = ''): ParamRow => ({ id: `row-${nextId.current++}`, key, value: '' });

  const [rows, setRows] = useState<ParamRow[]>(() => DEFAULT_KEYS.map((key) => newRow(key)));

  const url = useMemo(() => buildParamsUrl(baseUrl, rows), [baseUrl, rows]);
  const hasParams = url !== baseUrl;
  const atLimit = rows.length >= MAX_PARAMS;
  const unusedUtmKeys = UTM_KEYS.filter((k) => !rows.some((r) => r.key.toLowerCase() === k));

  const updateRow = (id: string, patch: Partial<ParamRow>) =>
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const key = patch.key !== undefined ? normalizeKey(patch.key) : row.key;
        const value = normalizeValue(key, patch.value !== undefined ? patch.value : row.value);
        return { ...row, key, value };
      }),
    );

  const addRow = (key = '') => setRows((prev) => (prev.length >= MAX_PARAMS ? prev : [...prev, newRow(key)]));
  const removeRow = (id: string) => setRows((prev) => prev.filter((r) => r.id !== id));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('utmBuilderCopied'));
    } catch {
      toast.error(t('utmBuilderCopyError'));
    }
  };

  return (
    <div className='flex flex-col gap-3'>
      <p className='text-xs text-dark/50'>{t('utmBuilderHint')}</p>

      <div className='flex flex-col gap-2'>
        {rows.map((row) => {
          const issue = rowIssue(rows, row);
          const valueOptions = UTM_VALUE_SUGGESTIONS[row.key.toLowerCase()];
          return (
            <div key={row.id} className='flex flex-col gap-1'>
              <div className='flex items-center gap-2'>
                <div className='flex-1 min-w-0 grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-2'>
                  <Input
                    size='sm'
                    rounded='lg'
                    list={`${listId}-keys`}
                    value={row.key}
                    maxLength={MAX_KEY_LENGTH}
                    onChange={(e) => updateRow(row.id, { key: e.target.value })}
                    placeholder={t('utmFieldKeyPlaceholder')}
                    aria-label={t('utmFieldKey')}
                    autoComplete='off'
                    autoCapitalize='off'
                    spellCheck={false}
                  />
                  <Input
                    size='sm'
                    rounded='lg'
                    list={valueOptions ? `${listId}-${row.key.toLowerCase()}` : undefined}
                    value={row.value}
                    onChange={(e) => updateRow(row.id, { value: e.target.value })}
                    placeholder={t('utmFieldValuePlaceholder')}
                    aria-label={t('utmFieldValue')}
                    autoComplete='off'
                    autoCapitalize='off'
                    spellCheck={false}
                  />
                </div>
                <Button
                  iconOnly
                  leftIcon={<TbX size={14} />}
                  variant='ghost'
                  size='xs'
                  rounded='lg'
                  className='text-dark/40 hover:text-danger flex-shrink-0'
                  onClick={() => removeRow(row.id)}
                  aria-label={t('utmRemoveParam')}
                />
              </div>
              {issue && (
                <p className='text-[11px] text-warning'>
                  {issue === 'reserved' ? t('utmIssueReserved') : t('utmIssueDuplicate')}
                </p>
              )}
              {!issue && row.key && !isUtmKey(row.key) && (
                <p className='text-[11px] text-dark/40'>{t('utmCustomKeyNote')}</p>
              )}
            </div>
          );
        })}
      </div>

      <datalist id={`${listId}-keys`}>
        {UTM_KEYS.map((k) => <option key={k} value={k} />)}
      </datalist>
      {Object.entries(UTM_VALUE_SUGGESTIONS).map(([key, values]) => (
        <datalist key={key} id={`${listId}-${key}`}>
          {values.map((v) => <option key={v} value={v} />)}
        </datalist>
      ))}

      <div className='flex flex-wrap items-center gap-1.5'>
        {unusedUtmKeys.map((k) => (
          <button
            key={k}
            type='button'
            disabled={atLimit}
            onClick={() => addRow(k)}
            className='flex items-center gap-1 px-2 py-1 rounded-full bg-dark/5 text-xs text-dark/60 hover:bg-dark/10 hover:text-dark disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed'
          >
            <TbPlus size={12} />
            {k}
          </button>
        ))}
        <button
          type='button'
          disabled={atLimit}
          onClick={() => addRow()}
          className='flex items-center gap-1 px-2 py-1 rounded-full border border-dashed border-dark/30 text-xs text-dark/60 hover:text-dark hover:border-dark/60 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed'
        >
          <TbPlus size={12} />
          {t('utmAddParam')}
        </button>
        <span className='text-[11px] text-dark/40 ml-auto'>{rows.length}/{MAX_PARAMS}</span>
      </div>

      <div className='flex flex-col gap-1'>
        <span className='text-[10px] font-bold uppercase tracking-wide text-dark/40'>{t('utmBuilderResult')}</span>
        <div className='flex items-center gap-2'>
          <code className='flex-1 min-w-0 truncate text-xs bg-dark/5 rounded-lg px-2 py-2 text-dark/70' title={url}>
            {url}
          </code>
          <Button
            iconOnly
            leftIcon={<TbCopy size={16} />}
            variant='ghost'
            size='sm'
            rounded='lg'
            className='text-dark/50 hover:text-dark/80 flex-shrink-0'
            onClick={handleCopy}
            aria-label={t('utmBuilderCopy')}
          />
        </div>
        {!hasParams && <p className='text-[11px] text-dark/40'>{t('utmBuilderEmpty')}</p>}
      </div>
    </div>
  );
}
