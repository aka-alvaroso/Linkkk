import React from 'react';
import Modal from '@/app/components/ui/Modal/Modal';
import Button from '@/app/components/ui/Button/Button';
import { TbAlertTriangle, TbX } from 'react-icons/tb';
import { useTranslations } from 'next-intl';

interface CancelSubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

export default function CancelSubscriptionModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: CancelSubscriptionModalProps) {
  const t = useTranslations('CancelSubscriptionModal');

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
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-danger/10 rounded-2xl">
              <TbAlertTriangle size={32} className="text-danger" />
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

        {/* Warning Message */}
        <div className="bg-warning/10 border-2 border-warning rounded-2xl p-4">
          <p className="text-sm font-semibold text-dark">
            {t('warningMessage')}
          </p>
        </div>

        {/* What Will Happen */}
        <div className="space-y-3">
          <h3 className="font-bold text-dark">{t('whatWillHappen')}</h3>
          <ul className="space-y-2 text-sm text-dark/80">
            <li className="flex items-start gap-2">
              <span className="text-danger font-bold mt-0.5">•</span>
              <span>{t('consequence1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-danger font-bold mt-0.5">•</span>
              <span>{t('consequence2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-danger font-bold mt-0.5">•</span>
              <span>{t('consequence3')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-danger font-bold mt-0.5">•</span>
              <span>{t('consequence4')}</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            size="md"
            rounded="xl"
            onClick={onClose}
            disabled={loading}
            className="flex-1 border-dark/20 hover:bg-dark/5"
          >
            {t('cancel')}
          </Button>
          <Button
            variant="solid"
            size="md"
            rounded="xl"
            onClick={onConfirm}
            loading={loading}
            className="flex-1 bg-danger hover:bg-danger/90 text-light border border-dark hover:shadow-[4px_4px_0_var(--color-dark)]"
          >
            {t('confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
