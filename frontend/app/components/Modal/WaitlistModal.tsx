import React, { useState } from 'react';
import Modal from '@/app/components/ui/Modal/Modal';
import Input from '@/app/components/ui/Input/Input';
import Button from '@/app/components/ui/Button/Button';
import { TbMail, TbCheck } from 'react-icons/tb';
import * as motion from 'motion/react-client';
import { API_CONFIG } from '@/app/config/api';
import { csrfService } from '@/app/services/api/csrfService';
import { useTranslations } from 'next-intl';

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const t = useTranslations('WaitlistModal');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setError('');

    if (!email) {
      setError(t('errorEmailRequired'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('errorEmailInvalid'));
      return;
    }

    setIsLoading(true);

    try {
      const csrfToken = await csrfService.getToken();

      const response = await fetch(`${API_CONFIG.BASE_URL}/waitlist`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t('errorJoinFailed'));
      }

      setIsSuccess(true);
      setEmail('');

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || t('errorGeneric'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setError('');
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="lg"
      rounded="3xl"
      closeOnOverlayClick={!isLoading}
      className="shadow-none"
    >
      <div className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ease: "backInOut" }}
            className="text-3xl font-black italic"
          >
            {t('title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05, ease: "backInOut" }}
            className="text-dark/70"
          >
            {t('description')}
          </motion.p>
        </div>

        {/* Success Message */}
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <TbCheck size={32} className="text-dark" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">{t('successTitle')}</h3>
              <p className="text-dark/70 mt-2">{t('successDescription')}</p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <motion.label
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, ease: "backInOut" }}
                className="text-lg font-semibold"
              >
                {t('emailLabel')}
              </motion.label>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, ease: "backInOut" }}
              >
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder={t('emailPlaceholder')}
                  size="md"
                  rounded="2xl"
                  leftIcon={<TbMail size={20} className="text-info" />}
                  className="w-full"
                  disabled={isLoading}
                />
              </motion.div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-danger"
                >
                  {error}
                </motion.p>
              )}
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, ease: "backInOut" }}
              className="mt-4"
            >
              <Button
                variant="solid"
                size="md"
                rounded="2xl"
                className="w-full rounded-xl hover:bg-primary hover:text-dark hover:shadow-[_4px_4px_0_var(--color-dark)]"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? t('joiningButton') : t('joinButton')}
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </Modal>
  );
}
