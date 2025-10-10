import React, { useEffect, useState } from 'react';
import Modal from '@/app/components/ui/Modal/Modal';
import Input from '@/app/components/ui/Input/Input';
import Select from '@/app/components/ui/Select/Select';
import Button from '@/app/components/ui/Button/Button';
import { TbSearch, TbCircleDashedCheck, TbCircleDashed, TbLockPassword, TbLockOpen, TbCalendarCheck, TbCalendarOff, TbHash, TbFilterOff } from 'react-icons/tb';

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
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black italic">Filter Links</h2>
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              rounded="xl"
              leftIcon={<TbFilterOff size={18} />}
              onClick={handleReset}
              className="text-danger hover:bg-danger/10"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="flex flex-col gap-2">
          <label className="text-lg font-semibold">Search</label>
          <Input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search by short URL or long URL..."
            size="md"
            rounded="2xl"
            leftIcon={<TbSearch size={20} className="text-info" />}
            className="w-full"
          />
          <p className="text-sm text-dark/50">
            Search in both short URLs and long URLs
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-2">
          <label className="text-lg font-semibold">Status</label>
          <Select
            options={[
              {
                label: 'All',
                value: 'all',
                customClassName: 'hover:bg-dark/5',
                selectedClassName: 'bg-dark/10'
              },
              {
                label: 'Active',
                value: 'active',
                leftIcon: <TbCircleDashedCheck size={16} />,
                customClassName: 'text-success hover:bg-success/10',
                selectedClassName: 'bg-success/15'
              },
              {
                label: 'Inactive',
                value: 'inactive',
                leftIcon: <TbCircleDashed size={16} />,
                customClassName: 'text-danger hover:bg-danger/10',
                selectedClassName: 'bg-danger/15'
              },
            ]}
            value={filters.status}
            onChange={(v) => setFilters({ ...filters, status: v as LinkFilters['status'] })}
            listClassName="rounded-2xl p-1 shadow-none transform origin-bottom bottom-12"
            buttonClassName="rounded-2xl border-dark/10 w-full"
            optionClassName="rounded-xl"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="md"
            rounded="2xl"
            className="flex-1 border-dark/20 text-dark/70 hover:bg-dark/5"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            size="md"
            rounded="2xl"
            className="flex-1 bg-info hover:bg-info/80"
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </Modal>
  );
}
