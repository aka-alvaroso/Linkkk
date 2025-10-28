"use client";
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button/Button';
import Input from '@/app/components/ui/Input/Input';
import { TbLock, TbKey, TbAlertCircle } from 'react-icons/tb';
import * as motion from 'motion/react-client';
import { linkService } from '@/app/services/api/linkService';
import { HttpError } from '@/app/utils/errors';

export default function PasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shortUrl = searchParams.get('shortUrl');
  const hint = searchParams.get('hint');

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (!shortUrl) {
      setError('Invalid link');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await linkService.verifyPassword(shortUrl, password);

      // Password correct - redirect to the actual URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Unable to access the link');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Password verification error:', err);

      if (err instanceof HttpError) {
        setError(err.userMessage || err.message || 'Incorrect password');
      } else {
        setError('An error occurred. Please try again.');
      }

      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-light to-info/5">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
        className="max-w-xl w-full bg-light rounded-3xl p-8"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.5 }}
          className="w-24 h-24 mx-auto flex items-center justify-center"
        >
          <TbLock size={48} className="text-warning" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-3xl md:text-4xl font-black italic mb-2 text-dark text-center"
        >
          Password Protected
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="text-center text-dark/70 mb-6"
        >
          This link is password protected. Enter the password to continue.
        </motion.p>

        {/* Hint */}
        {hint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="bg-info/5 border border-info/20 rounded-2xl p-4 flex flex-col items-start"
          >
              <h6 className='font-bold text-info'>Hint:</h6>
              <p className="text-dark/70">{hint}</p>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="lg"
              rounded="2xl"
              className="mt-2 text-center font-medium"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-danger/10 border border-danger/20 rounded-2xl p-3 flex items-center gap-2"
            >
              <TbAlertCircle size={20} className="text-danger flex-shrink-0" />
              <p className="text-sm text-danger">{error}</p>
            </motion.div>
          )}

          <Button
            type="submit"
            variant="solid"
            size="lg"
            rounded="2xl"
            disabled={isLoading}
            className="w-full bg-primary text-dark border border-dark hover:bg-primary/90 hover:shadow-[4px_4px_0_var(--color-dark)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 
              <p className='font-black italic'>
                  Verifying...
              </p> : 
              <p className='font-black italic'>
                Unlock
              </p>
            }
          </Button>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="mt-4 pt-6 border-t border-dark/10 text-center"
        >
          <p className="text-sm text-dark/50">
            Powered by <span className="font-black italic">Linkkk</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
