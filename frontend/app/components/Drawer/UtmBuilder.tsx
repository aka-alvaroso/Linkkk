'use client';
import { useId, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { TbChevronDown, TbCopy, TbShare2 } from 'react-icons/tb';
import Button from '../ui/Button/Button';
import Input from '../ui/Input/Input';
import { useToast } from '@/app/hooks/useToast';
import {
  EMPTY_UTM,
  UTM_SUGGESTIONS,
  buildUtmUrl,
  normalizeUtmValue,
  type UtmValues,
} from '@/app/utils/utm';

interface UtmBuilderProps {
  /** Short URL without query string, e.g. https://linkkk.dev/r/abc123 */
  baseUrl: string;
}

/**
 * Builds a ready-to-share variant of the short URL with utm_* params, so
 * nobody has to type them by hand. Nothing is saved: the params travel in the
 * URL itself and are recorded on each click.
 */
export default function UtmBuilder({ baseUrl }: UtmBuilderProps) {
  const t = useTranslations('EditLinkDrawer');
  const toast = useToast();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<UtmValues>(EMPTY_UTM);

  const url = useMemo(() => buildUtmUrl(baseUrl, values), [baseUrl, values]);
  const hasValues = url !== baseUrl;

  const setField = (field: keyof UtmValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [field]: normalizeUtmValue(e.target.value) }));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('utmBuilderCopied'));
    } catch {
      toast.error(t('utmBuilderCopyError'));
    }
  };

  return (
    <div className='flex flex-col gap-2 max-w-sm'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className='flex items-center gap-1.5 text-xs font-semibold text-dark/70 hover:text-dark w-fit cursor-pointer'
      >
        <TbShare2 size={14} />
        {t('utmBuilderTitle')}
        <TbChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className='flex flex-col gap-3 bg-white border border-dark/10 rounded-xl p-3'>
          <p className='text-xs text-dark/50'>{t('utmBuilderHint')}</p>

          <div className='grid grid-cols-1 sm:grid-cols-3 gap-2'>
            <div className='flex flex-col gap-1'>
              <label className='text-[10px] font-bold uppercase tracking-wide text-dark/40' htmlFor={`${listId}-source`}>
                {t('utmSources')}
              </label>
              <Input
                id={`${listId}-source`}
                size='sm'
                rounded='lg'
                list={`${listId}-sources`}
                value={values.source}
                onChange={setField('source')}
                placeholder={t('utmPlaceholderSource')}
                autoComplete='off'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-[10px] font-bold uppercase tracking-wide text-dark/40' htmlFor={`${listId}-medium`}>
                {t('utmMediums')}
              </label>
              <Input
                id={`${listId}-medium`}
                size='sm'
                rounded='lg'
                list={`${listId}-mediums`}
                value={values.medium}
                onChange={setField('medium')}
                placeholder={t('utmPlaceholderMedium')}
                autoComplete='off'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label className='text-[10px] font-bold uppercase tracking-wide text-dark/40' htmlFor={`${listId}-campaign`}>
                {t('utmCampaigns')}
              </label>
              <Input
                id={`${listId}-campaign`}
                size='sm'
                rounded='lg'
                value={values.campaign}
                onChange={setField('campaign')}
                placeholder={t('utmPlaceholderCampaign')}
                autoComplete='off'
              />
            </div>
          </div>

          <datalist id={`${listId}-sources`}>
            {UTM_SUGGESTIONS.source.map((s) => <option key={s} value={s} />)}
          </datalist>
          <datalist id={`${listId}-mediums`}>
            {UTM_SUGGESTIONS.medium.map((m) => <option key={m} value={m} />)}
          </datalist>

          <div className='flex flex-col gap-1'>
            <span className='text-[10px] font-bold uppercase tracking-wide text-dark/40'>{t('utmBuilderResult')}</span>
            <div className='flex items-center gap-2'>
              <code className='flex-1 min-w-0 truncate text-xs bg-dark/5 rounded-lg px-2 py-1.5 text-dark/70' title={url}>
                {url}
              </code>
              <Button
                iconOnly
                leftIcon={<TbCopy size={14} />}
                variant='ghost'
                size='xs'
                rounded='lg'
                className='text-dark/50 hover:text-dark/80 flex-shrink-0'
                onClick={handleCopy}
                aria-label={t('utmBuilderCopy')}
              />
            </div>
            {!hasValues && <p className='text-[10px] text-dark/40'>{t('utmBuilderEmpty')}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
