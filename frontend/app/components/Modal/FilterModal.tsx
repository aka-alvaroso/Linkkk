import React, { useEffect, useState } from 'react';
import Modal from '@/app/components/ui/Modal/Modal';
import Input from '@/app/components/ui/Input/Input';
import InlineSelect from '@/app/components/ui/InlineSelect/InlineSelect';
import Button from '@/app/components/ui/Button/Button';
import { TbSearch, TbCircleDashedCheck, TbCircleDashed, TbFilterOff, TbCircleFilled, TbTag, TbFolder, TbX } from 'react-icons/tb';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useTagStore } from '@/app/stores/tagStore';
import { useGroupStore } from '@/app/stores/groupStore';
import { useTags } from '@/app/hooks';
import { useGroups } from '@/app/hooks';
import TagChip, { isDark } from '@/app/components/Tags/TagChip';
import type { LinkFilters } from '@/app/types';

export type { LinkFilters };

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: LinkFilters) => void;
  initialFilters?: LinkFilters;
}

const defaultFilters: LinkFilters = {
  search: '',
  status: 'all',
  tagIds: [],
  groupIds: [],
};

export default function FilterModal({
  open,
  onClose,
  onApplyFilters,
  initialFilters = defaultFilters
}: FilterModalProps) {
  const t = useTranslations('FilterModal');
  const [filters, setFilters] = useState<LinkFilters>(initialFilters);
  const { tags } = useTagStore();
  const { groups } = useGroupStore();
  const { fetchTags } = useTags();
  const { fetchGroups } = useGroups();

  useEffect(() => {
    if (open) {
      fetchTags();
      fetchGroups();
    }
  }, [open, fetchTags, fetchGroups]);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  useEffect(() => {

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleApply();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };

  }, [filters, handleApply]);

  const handleReset = () => {
    setFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  const toggleTag = (tagId: number) => {
    const current = filters.tagIds ?? [];
    const next = current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId];
    setFilters({ ...filters, tagIds: next });
  };

  const toggleGroup = (groupId: number) => {
    const current = filters.groupIds ?? [];
    const next = current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId];
    setFilters({ ...filters, groupIds: next });
  };

  const hasActiveFilters = () => {
    return filters.search !== '' ||
      filters.status !== 'all' ||
      (filters.tagIds?.length ?? 0) > 0 ||
      (filters.groupIds?.length ?? 0) > 0;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      rounded="3xl"
      closeOnOverlayClick={true}
      className='shadow-none'
    >
      <div className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col justify-between">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ease: "backInOut" }}
            className="text-3xl font-black italic">
            {t('title')}
          </motion.h2>
          <AnimatePresence>
            {hasActiveFilters() && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: "backOut" }}
                className='absolute top-4 right-16'
              >
                <Button
                  variant="ghost"
                  size="sm"
                  rounded="xl"
                  leftIcon={<TbFilterOff size={18} />}
                  onClick={handleReset}
                  className=" text-danger hover:bg-danger/10"
                >
                  {t('clearAll')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-2">
          <motion.label
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, ease: "backInOut" }}
            className="text-lg font-semibold"
          >
            {t('searchLabel')}
          </motion.label>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, ease: "backInOut" }}
          >
            <Input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder={t('searchPlaceholder')}
              size="md"
              rounded="2xl"
              leftIcon={<TbSearch size={20} className="text-info" />}
              className="w-full"
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, ease: "backInOut" }}
            className="text-sm text-dark/50">
            {t('searchHint')}
          </motion.p>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-2">
          <motion.label
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, ease: "backInOut" }}
            className="text-lg font-semibold">
            {t('statusLabel')}
          </motion.label>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.175, ease: "backInOut" }}
            className=""
          >
            <InlineSelect
              options={[
                {
                  label: t('statusAll'),
                  value: 'all',
                  leftIcon: <TbCircleFilled size={16} />,
                },
                {
                  label: t('statusActive'),
                  value: 'active',
                  leftIcon: <TbCircleDashedCheck size={16} />,
                },
                {
                  label: t('statusInactive'),
                  value: 'inactive',
                  leftIcon: <TbCircleDashed size={16} />,
                },
              ]}
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v as LinkFilters['status'] })}
              buttonClassName=''
              selectedClassName={`${filters.status === "active" ? 'bg-primary border-dark' : filters.status === "inactive" ? 'bg-danger border-dark' : 'bg-light border-dark/30'}`}

            />
          </motion.div>
        </div>

        {/* Group filter */}
        {groups.length > 0 && (
          <div className="flex flex-col gap-2">
            <motion.label
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, ease: "backInOut" }}
              className="text-lg font-semibold flex items-center gap-2"
            >
              <TbFolder size={18} /> {t('groupLabel')}
            </motion.label>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.225, ease: "backInOut" }}
              className="flex flex-wrap gap-2"
            >
              {groups.map(group => {
                const selected = filters.groupIds?.includes(group.id) ?? false;
                const color = group.color ?? '#6b7280';
                const dark = isDark(color);
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-sm border font-medium"
                    style={{
                      backgroundColor: selected ? color : 'transparent',
                      borderColor: color,
                      color: selected ? (dark ? '#ffffff' : '#1b1b1b') : color,
                      transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: selected ? (dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.4)') : color,
                        transition: 'background-color 0.2s',
                      }}
                    />
                    {group.name}
                    <span
                      className="grid overflow-hidden transition-[grid-template-columns] duration-200 ease-out"
                      style={{ gridTemplateColumns: selected ? '1fr' : '0fr' }}
                    >
                      <span className="overflow-hidden flex items-center">
                        <TbX size={14} strokeWidth={2.5} />
                      </span>
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* Tag filter */}
        {tags.length > 0 && (
          <div className="flex flex-col gap-2">
            <motion.label
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, ease: "backInOut" }}
              className="text-lg font-semibold flex items-center gap-2"
            >
              <TbTag size={18} /> {t('tagLabel')}
            </motion.label>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.275, ease: "backInOut" }}
              className="flex flex-wrap gap-2"
            >
              {tags.map(tag => {
                const selected = filters.tagIds?.includes(tag.id) ?? false;
                return (
                  <div
                    key={tag.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleTag(tag.id)}
                    onKeyDown={(e) => e.key === 'Enter' && toggleTag(tag.id)}
                    className="cursor-pointer"
                  >
                    <TagChip
                      variant={selected ? 'solid' : 'outline'}
                      tag={tag}
                      size="md"
                      onRemove={selected ? () => toggleTag(tag.id) : undefined}
                    />
                  </div>
                );
              })}
            </motion.div>
          </div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, ease: "backInOut" }}
          className="mt-4"
        >
          <Button
            variant="solid"
            size="md"
            rounded="2xl"
            className='w-full rounded-xl hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]'
            onClick={handleApply}
          >
            {t('applyFilters')}
          </Button>
        </motion.div>
      </div>
    </Modal>
  );
}
