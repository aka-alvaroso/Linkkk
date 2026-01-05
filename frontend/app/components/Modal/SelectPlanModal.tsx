'use client';

import React, { useState } from 'react';
import Modal from '@/app/components/ui/Modal/Modal';
import Button from '@/app/components/ui/Button/Button';
import { TbRocket, TbX, TbSparkles } from 'react-icons/tb';
import { useTranslations } from 'next-intl';
import { subscriptionService } from '@/app/services/api/subscriptionService';
import { useToast } from '@/app/hooks/useToast';

interface SelectPlanModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SelectPlanModal({
  open,
  onClose,
}: SelectPlanModalProps) {
  const t = useTranslations('SelectPlanModal');
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly' | null>(null);

  const handleSelectPlan = async (period: 'monthly' | 'yearly') => {
    setSelectedPeriod(period);
    setLoading(true);
    try {
      await subscriptionService.createCheckoutSession(period);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout. Please try again.');
      setLoading(false);
      setSelectedPeriod(null);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      position="center"
      rounded="3xl"
      closeOnOverlayClick={!loading}
      showCloseButton={false}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary/20 rounded-2xl">
              <TbRocket size={32} className="text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic">{t('title')}</h2>
              <p className="text-sm text-dark/60">{t('subtitle')}</p>
            </div>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-dark/5 transition-colors"
              aria-label="Close modal"
            >
              <TbX size={24} className="text-dark/70" />
            </button>
          )}
        </div>

        {/* Plan Cards - Responsive Layout */}
        <div className="flex flex-col md:flex-row gap-4 pt-2">
          {/* Monthly Plan Card */}
          <div className="flex-1 border-2 border-dark/10 rounded-2xl p-6 hover:border-secondary/50 hover:shadow-lg transition-all duration-200">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black italic text-dark">
                  {t('monthly')}
                </h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black italic text-dark">
                  {t('monthlyPrice')}
                </span>
                <span className="text-lg text-dark/60">
                  {t('monthlyPeriod')}
                </span>
              </div>
              <Button
                variant="outline"
                size="md"
                rounded="xl"
                onClick={() => handleSelectPlan('monthly')}
                loading={loading && selectedPeriod === 'monthly'}
                disabled={loading}
                className="w-full border-dark hover:bg-dark hover:text-light hover:shadow-[4px_4px_0_var(--color-dark)] transition-all"
              >
                <span className="font-black italic">{t('selectButton')}</span>
              </Button>
            </div>
          </div>

          {/* Yearly Plan Card */}
          <div className="flex-1 border-2 border-secondary rounded-2xl p-6 bg-secondary/5 relative overflow-hidden hover:shadow-xl transition-all duration-200">
            {/* Save Badge */}
            <div className="absolute -top-1 -right-1">
              <div className="bg-warning text-dark px-3 py-1 rounded-bl-2xl rounded-tr-2xl flex items-center gap-1 shadow-lg">
                <TbSparkles size={16} />
                <span className="text-xs font-black italic">{t('saveAmount')}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-black italic text-dark">
                  {t('yearly')}
                </h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black italic text-dark">
                  {t('yearlyPrice')}
                </span>
                <span className="text-lg text-dark/60">
                  {t('yearlyPeriod')}
                </span>
              </div>
              <Button
                variant="solid"
                size="md"
                rounded="xl"
                onClick={() => handleSelectPlan('yearly')}
                loading={loading && selectedPeriod === 'yearly'}
                disabled={loading}
                className="w-full bg-secondary hover:bg-secondary/90 text-light border border-dark hover:shadow-[4px_4px_0_var(--color-dark)] transition-all"
              >
                <span className="font-black italic">{t('selectButton')}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
