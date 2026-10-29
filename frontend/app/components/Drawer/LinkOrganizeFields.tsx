import { useTranslations } from 'next-intl';
import * as motion from 'motion/react-client';
import { TbTag, TbFolder, TbWorld } from 'react-icons/tb';
import SelectDropdown from '@/app/components/ui/Select/SelectDropdown';
import type { CustomDomain } from '@/app/services/api/domainService';
import type { Group, Tag } from '@/app/types';

interface LinkOrganizeFieldsProps {
    isGuest: boolean;
    isPro: boolean;
    tags: Tag[];
    groups: Group[];
    activeDomains: CustomDomain[];
    selectedTagIds: number[];
    selectedGroupId: number | null;
    customDomainId: number | null;
    onTagsChange: (next: (string | number)[]) => void | Promise<void>;
    onGroupChange: (value: string | number | null) => void | Promise<void>;
    onCustomDomainChange: (domain: CustomDomain | null) => void;
}

/** Tags, group and custom domain selectors for a link. */
export default function LinkOrganizeFields({
    isGuest, isPro, tags, groups, activeDomains,
    selectedTagIds, selectedGroupId, customDomainId,
    onTagsChange, onGroupChange, onCustomDomainChange,
}: LinkOrganizeFieldsProps) {
    const t = useTranslations('EditLinkDrawer');

    return (
        <div className='flex items-center gap-2'>
            {/* Tags dropdown */}
            {!isGuest && tags.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15, duration: 0.4, ease: "backInOut" }}
                    className='flex flex-col gap-1'
                >
                    <span className='text-xs font-semibold text-dark/60 flex items-center gap-1'><TbTag size={12} /> {t('organizeTagsTitle')}</span>
                    <SelectDropdown
                        triggerClassName=''
                        mode="multi"
                        options={tags.map(tag => ({ label: tag.name, value: tag.id, color: tag.color ?? '#6b7280' }))}
                        values={selectedTagIds}
                        onChangeMulti={onTagsChange}
                        placeholder={t('organizeTagsPlaceholder')}
                    />
                </motion.div>
            )}

            {/* Group dropdown */}
            {!isGuest && groups.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4, ease: "backInOut" }}
                    className='flex flex-col gap-1'
                >
                    <span className='text-xs font-semibold text-dark/60 flex items-center gap-1'><TbFolder size={12} /> {t('organizeGroupTitle')}</span>
                    <SelectDropdown
                        mode="single"
                        options={groups.map(g => ({ label: g.name, value: g.id, color: g.color ?? '#6b7280' }))}
                        value={selectedGroupId}
                        onChange={onGroupChange}
                        placeholder={t('organizeNoGroup')}
                        showNoneOption
                        noneLabel={t('organizeNoGroup')}
                    />
                </motion.div>
            )}

            {/* Custom domain dropdown (PRO only) */}
            {!isGuest && isPro && activeDomains.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25, duration: 0.4, ease: "backInOut" }}
                    className='flex flex-col gap-1'
                >
                    <span className='text-xs font-semibold text-dark/60 flex items-center gap-1'><TbWorld size={12} /> {t('customDomain')}</span>
                    <SelectDropdown
                        mode="single"
                        options={activeDomains.map(d => ({ label: d.domain, value: d.id }))}
                        value={customDomainId}
                        onChange={(val) => onCustomDomainChange(val ? activeDomains.find(d => d.id === val) ?? null : null)}
                        placeholder={t('customDomainNone')}
                        showNoneOption
                        noneLabel={t('customDomainNone')}
                    />
                </motion.div>
            )}
        </div>
    );
}
