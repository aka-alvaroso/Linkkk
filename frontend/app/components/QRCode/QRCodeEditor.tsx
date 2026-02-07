'use client';

import React, { useEffect, useState, useCallback } from 'react';
import * as motion from 'motion/react-client';
import { TbDownload, TbRefresh } from 'react-icons/tb';
import Button from '@/app/components/ui/Button/Button';
import ColorPicker from './ColorPicker';
import LogoUploader from './LogoUploader';
import QRCodePreview, { downloadQRCode } from './QRCodePreview';
import { useQRConfig } from '@/app/hooks/useQRConfig';
import type { QRConfig, DotsStyle, CornersStyle } from '@/app/types/qr';
import { DEFAULT_QR_CONFIG } from '@/app/types/qr';
import { useToast } from '@/app/hooks/useToast';
import { useTranslations } from 'next-intl';
import { qrService } from '@/app/services/api/qrService';

function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(p => p); // Remove empty parts

    // Find the index of 'upload' in the path
    const uploadIndex = pathParts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) {
      return null;
    }

    // Get everything after 'upload'
    // Format: ['image', 'upload', 'v123', 'w_500', 'linkkk', 'qr-logos', '5708', 'logo_abc.png']
    let partsAfterUpload = pathParts.slice(uploadIndex + 1);

    // Skip version if present (starts with 'v' followed by numbers)
    if (partsAfterUpload[0]?.match(/^v\d+$/)) {
      partsAfterUpload = partsAfterUpload.slice(1);
    }

    // Skip transformations - they match pattern: single letter, underscore, then alphanumeric
    // Or combinations with commas: w_500,c_limit, etc.
    // Examples: w_500, h_500, c_limit, q_auto, f_auto, w_500,c_limit, etc.
    // The publicId starts when we find something that doesn't match transformation patterns
    let publicIdStartIndex = 0;

    for (let i = 0; i < partsAfterUpload.length; i++) {
      const part = partsAfterUpload[i];
      // Transformations match: [a-z]_[a-z0-9]+ (like w_500, c_limit)
      // Or combinations: [a-z]_[a-z0-9]+(,[a-z]_[a-z0-9]+)* (like w_500,c_limit)
      // PublicId folders don't match this pattern (like 'linkkk', 'qr-logos')
      const isTransformation = part && (
        part.match(/^[a-z]_[a-z0-9]+$/i) || // Single transformation: w_500
        part.match(/^[a-z]_[a-z0-9]+(,[a-z]_[a-z0-9]+)+$/i) // Multiple: w_500,c_limit
      );

      if (!isTransformation) {
        publicIdStartIndex = i;
        break;
      }
    }

    // Join all parts from publicIdStartIndex onwards
    const publicIdWithExt = partsAfterUpload.slice(publicIdStartIndex).join('/');

    if (!publicIdWithExt) {
      return null;
    }

    // Remove file extension
    const publicId = publicIdWithExt.replace(/\.(jpg|jpeg|png|gif|webp|svg)$/i, '');

    return publicId || null;
  } catch (error) {
    console.error('Error extracting Cloudinary publicId:', error, url);
    return null;
  }
}

interface QRCodeEditorProps {
  shortUrl: string;
  onConfigChange?: (
    hasChanges: boolean,
    save: () => Promise<void>,
    cancel: () => void
  ) => void;
}

const DOTS_STYLES: { value: DotsStyle; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'dots', label: 'Dots' },
];

const CORNERS_STYLES: { value: CornersStyle; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'rounded', label: 'Rounded' },
];

export default function QRCodeEditor({
  shortUrl,
  onConfigChange,
}: QRCodeEditorProps) {
  const t = useTranslations('QRCodeEditor');
  const toast = useToast();
  const {
    config,
    isLoading,
    isSaving,
    fetchConfig,
    updateConfig,
    updateLocalConfig,
  } = useQRConfig(shortUrl);

  const [originalConfig, setOriginalConfig] = useState<QRConfig>(DEFAULT_QR_CONFIG);
  const [isDownloading, setIsDownloading] = useState(false);
  // Track uploaded logo publicIds that haven't been saved yet
  const [orphanedLogoIds, setOrphanedLogoIds] = useState<string[]>([]);

  // QR URL
  const qrUrl = `https://linkkk.dev/r/${shortUrl}?src=qr`;

  // Load config on mount
  useEffect(() => {
    fetchConfig().then((result) => {
      if (result.success && result.data) {
        setOriginalConfig(result.data);
      }
    });
  }, [fetchConfig]);

  // Check if config has changes
  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  // Save handler - clear orphaned logos and delete removed logos from Cloudinary
  const handleSave = useCallback(async () => {
    // Check if logo was removed (had logo before, now null/empty)
    const hadLogo = originalConfig.logoUrl && originalConfig.logoUrl.trim() !== '';
    const hasLogo = config.logoUrl && config.logoUrl.trim() !== '';
    const logoRemoved = hadLogo && !hasLogo;
    const logoChanged = hadLogo && hasLogo && originalConfig.logoUrl !== config.logoUrl;

    // If logo was removed or changed, and the old logo was from Cloudinary, delete it
    if ((logoRemoved || logoChanged) && originalConfig.logoUrl) {
      const oldPublicId = extractCloudinaryPublicId(originalConfig.logoUrl);
      if (oldPublicId) {
        try {
          console.log('Deleting old logo from Cloudinary:', {
            oldLogoUrl: originalConfig.logoUrl,
            publicId: oldPublicId,
            reason: logoRemoved ? 'removed' : 'changed'
          });
          await qrService.deleteLogo(oldPublicId);
          console.log('Old logo deleted successfully');
        } catch (error) {
          // Log but don't block save if deletion fails
          console.error('Failed to delete old logo from Cloudinary:', {
            error,
            publicId: oldPublicId,
            logoUrl: originalConfig.logoUrl
          });
        }
      } else {
        console.warn('Could not extract publicId from logo URL:', originalConfig.logoUrl);
      }
    }

    const result = await updateConfig(config);
    if (result.success) {
      setOriginalConfig(config);
      setOrphanedLogoIds([]); // Clear orphaned logos since config is saved
      toast.success(t('saveSuccess'));
    } else {
      toast.error(t('saveError'));
    }
  }, [config, originalConfig, updateConfig, toast, t]);

  // Cancel handler - delete orphaned logos from Cloudinary
  const handleCancel = useCallback(async () => {
    // Delete any orphaned logos that were uploaded but not saved
    if (orphanedLogoIds.length > 0) {
      try {
        await Promise.all(
          orphanedLogoIds.map((publicId) => qrService.deleteLogo(publicId))
        );
      } catch (error) {
        // Log but don't block cancellation if deletion fails
        console.error('Failed to delete orphaned logos:', error);
      }
      setOrphanedLogoIds([]);
    }
    updateLocalConfig(originalConfig);
  }, [originalConfig, updateLocalConfig, orphanedLogoIds]);

  // Notify parent of changes
  useEffect(() => {
    onConfigChange?.(hasChanges, handleSave, handleCancel);
  }, [hasChanges, handleSave, handleCancel, onConfigChange]);

  // Download handler
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadQRCode(qrUrl, config, `qr-${shortUrl}`, 1000);
      toast.success(t('downloadSuccess'));
    } catch {
      toast.error(t('downloadError'));
    } finally {
      setIsDownloading(false);
    }
  };

  // Reset to defaults
  const handleReset = () => {
    updateLocalConfig(DEFAULT_QR_CONFIG);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6"
    >
      {/* Preview and Controls */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* QR Preview */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }}
            className="p-4 bg-white rounded-2xl shadow-sm border border-dark/5"
          >
            <QRCodePreview url={qrUrl} config={config} size={175} />
          </motion.div>

          {/* Download button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.075, duration: 0.4, ease: "backInOut" }}
          >
            <Button
              variant="solid"
              size="md"
              rounded="2xl"
              leftIcon={<TbDownload size={20} />}
              className="bg-primary text-dark w-full"
              onClick={handleDownload}
              loading={isDownloading}
            >
              {t('download')}
            </Button>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Colors */}
          <ColorPicker
            label={t('foregroundColor')}
            value={config.foregroundColor}
            onChange={(color) => updateLocalConfig({ foregroundColor: color })}
          />

          <ColorPicker
            label={t('backgroundColor')}
            value={config.backgroundColor}
            onChange={(color) => updateLocalConfig({ backgroundColor: color })}
          />

          {/* Dots Style */}
          <div className="flex flex-col gap-2">
            <motion.label
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.4, ease: "backInOut" }}
              className="text-sm font-medium text-dark/70"
            >
              {t('dotsStyle')}
            </motion.label>
            <div className="flex gap-2 flex-wrap">
              {DOTS_STYLES.map((style, i) => (
                <motion.button
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + 0.05 * i, duration: 0.4, ease: "backInOut" }}
                  key={style.value}
                  type="button"
                  onClick={() => updateLocalConfig({ dotsStyle: style.value })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${config.dotsStyle === style.value
                    ? 'bg-dark text-light'
                    : 'bg-dark/5 text-dark/70 hover:bg-dark/10'
                    }`}
                >
                  {style.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Corners Style */}
          <div className="flex flex-col gap-2">
            <motion.label
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.4, ease: "backInOut" }} className="text-sm font-medium text-dark/70">
              {t('cornersStyle')}
            </motion.label>
            <div className="flex gap-2 flex-wrap">
              {CORNERS_STYLES.map((style, i) => (
                <motion.button
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + 0.05 * i, duration: 0.4, ease: "backInOut" }}
                  key={style.value}
                  type="button"
                  onClick={() => updateLocalConfig({ cornersStyle: style.value })}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${config.cornersStyle === style.value
                    ? 'bg-dark text-light'
                    : 'bg-dark/5 text-dark/70 hover:bg-dark/10'
                    }`}
                >
                  {style.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <LogoUploader
            shortUrl={shortUrl}
            currentLogoUrl={config.logoUrl}
            onLogoChange={(url, publicId) => {
              updateLocalConfig({ logoUrl: url });
              // Track publicId if it's a new Cloudinary upload (not from original config)
              if (publicId && url && url.startsWith('https://res.cloudinary.com')) {
                setOrphanedLogoIds((prev) => {
                  // Only add if not already tracked
                  if (!prev.includes(publicId)) {
                    return [...prev, publicId];
                  }
                  return prev;
                });
              }
            }}
          />

          {/* Reset button */}
          <Button
            variant="ghost"
            size="sm"
            rounded="xl"
            leftIcon={<TbRefresh size={18} />}
            className="self-start text-dark/50 hover:text-dark"
            onClick={handleReset}
          >
            {t('resetDefaults')}
          </Button>
        </div>
      </div>
    </div>
  );
}
