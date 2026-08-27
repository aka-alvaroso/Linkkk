'use client';

import React, { useState, useRef, useCallback } from 'react';
import * as motion from 'motion/react-client';
import { TbUpload, TbLink, TbX, TbPhoto, TbAlertCircle } from 'react-icons/tb';
import Button from '@/app/components/ui/Button/Button';
import Input from '@/app/components/ui/Input/Input';
import { metadataService } from '@/app/services/api/metadataService';
import { useToast } from '@/app/hooks/useToast';
import { useTranslations } from 'next-intl';
import { cn } from '@/app/utils/cn';

interface MetadataImageUploaderProps {
  shortUrl: string;
  currentImageUrl: string | null;
  onImageChange: (url: string | null, publicId?: string) => void;
}

type TabType = 'upload' | 'url';

const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export default function MetadataImageUploader({
  shortUrl,
  currentImageUrl,
  onImageChange,
}: MetadataImageUploaderProps) {
  const t = useTranslations('LinkMetadataEditor');
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<TabType>(
    currentImageUrl ? 'url' : 'upload'
  );
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(currentImageUrl || '');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return t('imageUpload.invalidType');
    }
    if (file.size > MAX_SIZE) {
      return t('imageUpload.fileTooLarge');
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
        const result = await metadataService.uploadImage(shortUrl, file);
        onImageChange(result.ogImageUrl, result.publicId);
        toast.success(t('imageUpload.success'));
        setPreviewUrl(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : t('imageUpload.failed');
        setError(message);
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
        URL.revokeObjectURL(objectUrl);
      }
    },
    [shortUrl, onImageChange, toast, t]
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
      onImageChange(null);
      return;
    }

    try {
      const url = new URL(urlInput);
      if (url.protocol !== 'https:') {
        setError(t('imageUpload.httpsRequired'));
        return;
      }
      onImageChange(urlInput);
      setError(null);
    } catch {
      setError(t('imageUpload.invalidUrl'));
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
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
        {t('imageLabel')}
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
          {t('imageUpload.tabUpload')}
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
          {t('imageUpload.tabUrl')}
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
                className="w-32 h-16 object-cover rounded-lg"
              />
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-dark/50">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  {t('imageUpload.uploading')}
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
                  {t('imageUpload.dragDrop')}
                </p>
                <p className="text-xs text-dark/50 mt-1">
                  {t('imageUpload.or')}{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary hover:underline"
                  >
                    {t('imageUpload.browse')}
                  </button>
                </p>
              </div>
              <p className="text-xs text-dark/60">
                PNG, JPG, GIF, WEBP - Max 2MB - Recommended 1200x630px
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
              placeholder="https://example.com/image.png"
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
              {t('imageUpload.apply')}
            </Button>
          </motion.div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
          <TbAlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Current Image Preview */}
      {currentImageUrl && (
        <div className="flex items-center gap-3 p-3 bg-dark/5 rounded-xl">
          <motion.img
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16, duration: 0.3, ease: "backInOut" }}
            src={currentImageUrl}
            alt="Current OG image"
            className="w-16 h-10 object-cover rounded-lg bg-white"
          />
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.3, ease: "backInOut" }}
            className="flex-1 text-sm text-dark/70 truncate"
          >
            {currentImageUrl.length > 40
              ? currentImageUrl.substring(0, 40) + '...'
              : currentImageUrl}
          </motion.span>
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.3, ease: "backInOut" }}
            type="button"
            onClick={handleRemoveImage}
            className="p-2 hover:bg-dark/10 rounded-lg transition-colors"
            title={t('imageUpload.remove')}
          >
            <TbX size={18} className="text-dark/50" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
