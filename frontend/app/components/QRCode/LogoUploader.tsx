'use client';

import React, { useState, useRef, useCallback } from 'react';
import * as motion from 'motion/react-client';
import { TbUpload, TbLink, TbX, TbPhoto, TbAlertCircle } from 'react-icons/tb';
import Button from '@/app/components/ui/Button/Button';
import Input from '@/app/components/ui/Input/Input';
import { qrService } from '@/app/services/api/qrService';
import { useToast } from '@/app/hooks/useToast';
import { useTranslations } from 'next-intl';
import { cn } from '@/app/utils/cn';

interface LogoUploaderProps {
  shortUrl: string;
  currentLogoUrl: string | null;
  onLogoChange: (url: string | null, publicId?: string) => void;
}

type TabType = 'upload' | 'url';

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export default function LogoUploader({
  shortUrl,
  currentLogoUrl,
  onLogoChange,
}: LogoUploaderProps) {
  const t = useTranslations('QRCodeEditor');
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>(
    currentLogoUrl ? 'url' : 'upload'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(currentLogoUrl || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t('logoUpload.invalidType');
    }
    if (file.size > MAX_SIZE) {
      return t('logoUpload.fileTooLarge');
    }
    return null;
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      setIsUploading(true);
      try {
        const result = await qrService.uploadLogo(shortUrl, file);
        onLogoChange(result.logoUrl, result.publicId);
        toast.success(t('logoUpload.success'));
        setPreviewUrl(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t('logoUpload.failed');
        setError(message);
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [shortUrl, onLogoChange, toast, t]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      onLogoChange(null);
      return;
    }

    try {
      const url = new URL(urlInput);
      if (url.protocol !== 'https:') {
        setError(t('logoUpload.httpsRequired'));
        return;
      }
      onLogoChange(urlInput);
      setError(null);
    } catch {
      setError(t('logoUpload.invalidUrl'));
    }
  };

  const handleRemoveLogo = () => {
    onLogoChange(null);
    setUrlInput('');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <motion.label
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: "backInOut" }}
        className="text-sm font-medium text-dark/70"
      >
        {t('logoUrl')}
      </motion.label>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.4, ease: "backInOut" }}
        className="flex gap-1 p-1 bg-dark/5 rounded-xl"
      >
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all',
            activeTab === 'upload'
              ? 'bg-white text-dark shadow-sm'
              : 'text-dark/50 hover:text-dark/70'
          )}
        >
          <TbUpload size={18} />
          {t('logoUpload.tabUpload')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all',
            activeTab === 'url'
              ? 'bg-white text-dark shadow-sm'
              : 'text-dark/50 hover:text-dark/70'
          )}
        >
          <TbLink size={18} />
          {t('logoUpload.tabUrl')}
        </button>
      </motion.div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3, ease: "backInOut" }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-6 transition-all text-center',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-dark/10 hover:border-dark/20',
            isUploading && 'opacity-50 pointer-events-none'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.gif,.webp"
            onChange={handleInputChange}
            className="hidden"
          />

          {previewUrl ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-20 h-20 object-contain rounded-lg"
              />
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-dark/50">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  {t('logoUpload.uploading')}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-dark/5 rounded-full flex items-center justify-center">
                <TbPhoto size={24} className="text-dark/40" />
              </div>
              <div>
                <p className="text-sm font-medium text-dark/70">
                  {t('logoUpload.dragDrop')}
                </p>
                <p className="text-xs text-dark/50 mt-1">
                  {t('logoUpload.or')}{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:underline"
                  >
                    {t('logoUpload.browse')}
                  </button>
                </p>
              </div>
              <p className="text-xs text-dark/40">
                PNG, JPG, GIF, WEBP - Max 2MB - Min 150x150px
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* URL Tab */}
      {activeTab === 'url' && (
        <div className="flex flex-col gap-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3, ease: "backInOut" }}
            className="flex gap-2"
          >
            <Input
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                setError(null);
              }}
              placeholder="https://example.com/logo.png"
              size="md"
              rounded="xl"
              className="flex-1"
            />
            <Button
              variant="solid"
              size="md"
              rounded="xl"
              onClick={handleUrlSubmit}
              className="bg-primary text-dark"
            >
              {t('logoUpload.apply')}
            </Button>
          </motion.div>
          <p className="text-xs text-dark/50">{t('logoUrlHint')}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
          <TbAlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Current Logo Preview */}
      {currentLogoUrl && (
        <div className="flex items-center gap-3 p-3 bg-dark/5 rounded-xl">
          <motion.img
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.3, ease: "backInOut" }}
            src={currentLogoUrl}
            alt="Current logo"
            className="w-10 h-10 object-contain rounded-lg bg-white"
          />
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.3, ease: "backInOut" }}
            className="flex-1 text-sm text-dark/70 truncate"
          >
            {currentLogoUrl.length > 40
              ? currentLogoUrl.substring(0, 40) + '...'
              : currentLogoUrl}
          </motion.span>
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.3, ease: "backInOut" }}
            type="button"
            onClick={handleRemoveLogo}
            className="p-2 hover:bg-dark/10 rounded-lg transition-colors"
            title={t('logoUpload.remove')}
          >
            <TbX size={18} className="text-dark/50" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
