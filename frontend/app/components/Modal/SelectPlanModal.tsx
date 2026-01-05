'use client';

import React, { useState } from 'react';
import Modal from '@/app/components/ui/Modal/Modal';
import Button from '@/app/components/ui/Button/Button';
import { TbRocket, TbX, TbCheck } from 'react-icons/tb';
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
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('yearly');

  const handleContinue = async () => {
    setLoading(true);
    try {
      await subscriptionService.createCheckoutSession(selectedPeriod);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      position="center"
      rounded="3xl"
      closeOnOverlayClick={!loading}
      showCloseButton={false}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden md:block p-2.5 bg-secondary/20 rounded-2xl">
              <TbRocket size={28} className="text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic">{t('title')}</h2>
              <p className="text-sm text-dark/60">{t('subtitle')}</p>
            </div>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-dark/5 transition-colors flex-shrink-0"
              aria-label="Close modal"
            >
              <TbX size={20} className="text-dark/70" />
            </button>
          )}
        </div>

        {/* Plan Cards - Checkable Style */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Monthly Plan Card */}
          <button
            onClick={() => setSelectedPeriod('monthly')}
            disabled={loading}
            className={`flex-1 bg-dark/5 md:max-w-1/2 min-w-0 border rounded-2xl p-5 transition-all duration-200 text-left relative
              ${selectedPeriod === 'monthly'
                ? 'border-secondary '
                : 'border-transparent  hover:border-dark/10'
              }
            `}
          >
            {/* Check indicator */}
            <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
              ${selectedPeriod === 'monthly'
                ? 'border-secondary bg-secondary'
                : 'border-dark/20'
              }
            `}>
              {selectedPeriod === 'monthly' && (
                <TbCheck size={14} className="text-light" strokeWidth={3} />
              )}
            </div>

            <div className="space-y-2 pr-8">
              <h3 className="text-lg font-black italic text-dark">
                {t('monthly')}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black italic text-dark">
                  {t('monthlyPrice')}
                </span>
                <span className="text-base text-dark/60">
                  {t('monthlyPeriod')}
                </span>
              </div>
            </div>
          </button>

          {/* Yearly Plan Card */}
          <div className="flex-1 md:max-w-1/2 min-w-0 relative">
            {/* Best Value Pill */}
            <div className="absolute flex justify-center w-2/3 -top-2 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-warning text-dark px-3 py-1 rounded-full flex items-center gap-1 border border-dark">
                <span className="text-xs font-black italic">{t('bestValue')}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedPeriod('yearly')}
              disabled={loading}
              className={`w-full bg-dark/5 border rounded-2xl p-5 transition-all duration-200 text-left relative pt-6
                ${selectedPeriod === 'yearly'
                  ? 'border-secondary'
                : 'border-transparent hover:border-dark/10'
                }
              `}
            >
              {/* Check indicator */}
              <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${selectedPeriod === 'yearly'
                  ? 'border-secondary bg-secondary'
                  : 'border-dark/20'
                }
              `}>
                {selectedPeriod === 'yearly' && (
                  <TbCheck size={14} className="text-light" strokeWidth={3} />
                )}
              </div>

              <div className="space-y-2 pr-8">
                <h3 className="text-lg font-black italic text-dark">
                  {t('yearly')}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black italic text-dark">
                    {t('yearlyPrice')}
                  </span>
                  <span className="text-base text-dark/60">
                    {t('yearlyPeriod')}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center pt-2">
          <Button
            variant="solid"
            size="lg"
            rounded="2xl"
            onClick={handleContinue}
            loading={loading}
            disabled={loading}
            className="bg-dark hover:bg-primary hover:text-dark border-dark hover:shadow-[4px_4px_0_var(--color-dark)] transition-all px-12"
          >
            <span className="font-black italic">{t('continueButton')}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
