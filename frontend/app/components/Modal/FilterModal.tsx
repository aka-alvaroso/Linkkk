import React, { useEffect, useState } from 'react';
import Modal from '@/app/components/ui/Modal/Modal';
import Input from '@/app/components/ui/Input/Input';
import Select from '@/app/components/ui/Select/Select';
import Button from '@/app/components/ui/Button/Button';
import { TbSearch, TbCircleDashedCheck, TbCircleDashed, TbFilterOff, TbCircleFilled } from 'react-icons/tb';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';

export interface LinkFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
}

interface FilterModalProps {
  open: boolean;
  onClose: () => void;
  onApplyFilters: (filters: LinkFilters) => void;
  initialFilters?: LinkFilters;
}

const defaultFilters: LinkFilters = {
  search: '',
  status: 'all',
};

export default function FilterModal({
  open,
  onClose,
  onApplyFilters,
  initialFilters = defaultFilters
}: FilterModalProps) {
  const [filters, setFilters] = useState<LinkFilters>(initialFilters);

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

  }, [filters]);

  const handleReset = () => {
    setFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  const hasActiveFilters = () => {
    return filters.search !== '' ||
           filters.status !== 'all'
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      rounded="3xl"
      closeOnOverlayClick={true}
    >
      <div className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col justify-between">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ease: "backInOut" }}
            className="text-3xl font-black italic">
            Filter Links
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
                  Clear all
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
            Search
          </motion.label>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, ease: "backInOut" }}
          >
            <Input
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by short URL or long URL..."
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
            Search in both short URLs and long URLs
          </motion.p>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-2">
          <motion.label 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, ease: "backInOut" }}
            className="text-lg font-semibold">
              Status
          </motion.label>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.175, ease: "backInOut" }}
            className=""
          >
            <Select
              options={[
                {
                  label: 'All',
                  value: 'all',
                  leftIcon: <TbCircleFilled size={16} />,
                  customClassName: 'text-dark/50 bg-dark/10 hover:text-dark hover:bg-dark/25',
                  selectedClassName: 'text-dark bg-dark/25'
                },
                {
                  label: 'Active',
                  value: 'active',
                  leftIcon: <TbCircleDashedCheck size={16} />,
                  customClassName: 'mt-1 text-dark bg-success/25 hover:bg-success',
                  selectedClassName: 'bg-success'
                },
                {
                  label: 'Inactive',
                  value: 'inactive',
                  leftIcon: <TbCircleDashed size={16} />,
                  customClassName: 'mt-1 text-light bg-danger/25 hover:bg-danger',
                  selectedClassName: 'bg-danger'
                },
              ]}
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v as LinkFilters['status'] })}
              listClassName="rounded-2xl p-1 shadow-none transform origin-bottom bottom-12"
              buttonClassName="rounded-2xl border-dark/10 w-full"
              optionClassName="rounded-xl"
            />
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, ease: "backInOut" }}
            className="flex-1"
          >
            <Button
              variant="outline"
              size="md"
              rounded="2xl"
              className='w-full rounded-xl border-danger text-danger hover:bg-danger/15 hover:text-danger'
              onClick={onClose}
              >
              Cancel
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, ease: "backInOut" }}
            className="flex-1"
          >
            <Button
              variant="solid"
              size="md"
              rounded="2xl"
              className='w-full rounded-xl hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]'
              onClick={handleApply}
            >
              Apply Filters
            </Button>
          </motion.div>
        </div>
      </div>
    </Modal>
  );
}
