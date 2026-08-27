'use client';

import React, { useEffect, useState, useCallback } from 'react';
import * as motion from 'motion/react-client';
import { TbPhoto } from 'react-icons/tb';
import Input from '@/app/components/ui/Input/Input';
import Switch from '@/app/components/ui/Switch/Switch';
import MetadataImageUploader from './MetadataImageUploader';
import { useLinkMetadata } from '@/app/hooks/useLinkMetadata';
import type { LinkMetadata } from '@/app/types/metadata';
import { DEFAULT_LINK_METADATA } from '@/app/types/metadata';
import { useToast } from '@/app/hooks/useToast';
import { useTranslations } from 'next-intl';
import { metadataService } from '@/app/services/api/metadataService';

const OG_TITLE_MAX = 300;
const OG_DESCRIPTION_MAX = 500;

function extractCloudinaryPublicId(url: string): string | null {
  if (!url || !url.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter((p) => p);

    const uploadIndex = pathParts.findIndex((part) => part === 'upload');
    if (uploadIndex === -1) {
      return null;
    }

    let partsAfterUpload = pathParts.slice(uploadIndex + 1);

    if (partsAfterUpload[0]?.match(/^v\d+$/)) {
      partsAfterUpload = partsAfterUpload.slice(1);
    }

    let publicIdStartIndex = 0;
    for (let i = 0; i < partsAfterUpload.length; i++) {
      const part = partsAfterUpload[i];
      const isTransformation =
        part &&
        (part.match(/^[a-z]_[a-z0-9]+$/i) ||
          part.match(/^[a-z]_[a-z0-9]+(,[a-z]_[a-z0-9]+)+$/i));

      if (!isTransformation) {
        publicIdStartIndex = i;
        break;
      }
    }

    const publicIdWithExt = partsAfterUpload.slice(publicIdStartIndex).join('/');
    if (!publicIdWithExt) {
      return null;
    }

    const publicId = publicIdWithExt.replace(/\.(jpg|jpeg|png|gif|webp|svg)$/i, '');
    return publicId || null;
  } catch (error) {
    console.error('Error extracting Cloudinary publicId:', error, url);
    return null;
  }
}

interface LinkMetadataEditorProps {
  shortUrl: string;
  onConfigChange?: (
    hasChanges: boolean,
    save: () => Promise<void>,
    cancel: () => void
  ) => void;
}

export default function LinkMetadataEditor({
  shortUrl,
  onConfigChange,
}: LinkMetadataEditorProps) {
  const t = useTranslations('LinkMetadataEditor');
  const toast = useToast();
  const {
    config,
    isLoading,
    fetchConfig,
    updateConfig,
    updateLocalConfig,
  } = useLinkMetadata(shortUrl);

  const [originalConfig, setOriginalConfig] = useState<LinkMetadata>(DEFAULT_LINK_METADATA);
  const [orphanedImageIds, setOrphanedImageIds] = useState<string[]>([]);

  useEffect(() => {
    fetchConfig().then((result) => {
      if (result.success && result.data) {
        setOriginalConfig(result.data);
      }
    });
  }, [fetchConfig]);

  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  const handleSave = useCallback(async () => {
    const hadImage = originalConfig.ogImageUrl && originalConfig.ogImageUrl.trim() !== '';
    const hasImage = config.ogImageUrl && config.ogImageUrl.trim() !== '';
    const imageRemoved = hadImage && !hasImage;
    const imageChanged = hadImage && hasImage && originalConfig.ogImageUrl !== config.ogImageUrl;

    if ((imageRemoved || imageChanged) && originalConfig.ogImageUrl) {
      const oldPublicId = extractCloudinaryPublicId(originalConfig.ogImageUrl);
      if (oldPublicId) {
        try {
          await metadataService.deleteImage(oldPublicId);
        } catch (error) {
          console.error('Failed to delete old metadata image from Cloudinary:', error);
        }
      }
    }

    const result = await updateConfig(config);
    if (result.success) {
      setOriginalConfig(config);
      setOrphanedImageIds([]);
      toast.success(t('toastSaveSuccess'));
    } else {
      toast.error(t('toastSaveFailed'));
    }
  }, [config, originalConfig, updateConfig, toast, t]);

  const handleCancel = useCallback(async () => {
    if (orphanedImageIds.length > 0) {
      try {
        await Promise.all(
          orphanedImageIds.map((publicId) => metadataService.deleteImage(publicId))
        );
      } catch (error) {
        console.error('Failed to delete orphaned metadata images:', error);
      }
      setOrphanedImageIds([]);
    }
    updateLocalConfig(originalConfig);
  }, [originalConfig, updateLocalConfig, orphanedImageIds]);

  useEffect(() => {
    onConfigChange?.(hasChanges, handleSave, handleCancel);
  }, [hasChanges, handleSave, handleCancel, onConfigChange]);

  const previewTitle = config.ogTitle?.trim() || t('previewFallbackTitle');
  const previewDescription = config.ogDescription?.trim() || '';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Enable toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.4, ease: "backInOut" }}
        className="flex items-center justify-between p-3 bg-dark/5 rounded-xl"
      >
        <div className="flex flex-col">
          <span className="text-sm font-medium text-dark">{t('enabledLabel')}</span>
          <span className="text-xs text-dark/50">{t('enabledHint')}</span>
        </div>
        <Switch
          checked={config.enabled}
          onChange={(checked) => updateLocalConfig({ enabled: checked })}
          size="sm"
        />
      </motion.div>

      <div className={config.enabled ? '' : 'opacity-50 pointer-events-none'}>
        <div className="flex flex-col gap-4">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: "backInOut" }}
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-dark/70">{t('ogTitleLabel')}</label>
              <span className="text-xs text-dark/40">
                {(config.ogTitle?.length ?? 0)}/{OG_TITLE_MAX}
              </span>
            </div>
            <Input
              value={config.ogTitle ?? ''}
              onChange={(e) => updateLocalConfig({ ogTitle: e.target.value })}
              placeholder={t('ogTitlePlaceholder')}
              size="md"
              rounded="xl"
              maxLength={OG_TITLE_MAX}
            />
            <p className="text-xs text-dark/50">{t('ogTitleHint')}</p>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "backInOut" }}
            className="flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-dark/70">{t('ogDescriptionLabel')}</label>
              <span className="text-xs text-dark/40">
                {(config.ogDescription?.length ?? 0)}/{OG_DESCRIPTION_MAX}
              </span>
            </div>
            <Input
              textarea
              value={config.ogDescription ?? ''}
              onChange={(e) => updateLocalConfig({ ogDescription: e.target.value })}
              placeholder={t('ogDescriptionPlaceholder')}
              size="md"
              rounded="xl"
              maxLength={OG_DESCRIPTION_MAX}
              rows={3}
            />
            <p className="text-xs text-dark/50">{t('ogDescriptionHint')}</p>
          </motion.div>

          {/* Image */}
          <MetadataImageUploader
            shortUrl={shortUrl}
            currentImageUrl={config.ogImageUrl}
            onImageChange={(url, publicId) => {
              updateLocalConfig({ ogImageUrl: url });
              if (publicId && url && url.startsWith('https://res.cloudinary.com')) {
                setOrphanedImageIds((prev) => (prev.includes(publicId) ? prev : [...prev, publicId]));
              }
            }}
          />

          {/* Live preview */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "backInOut" }}
            className="flex flex-col gap-1.5"
          >
            <label className="text-sm font-medium text-dark/70">{t('previewLabel')}</label>
            <div className="border border-dark/10 rounded-xl overflow-hidden max-w-sm bg-white">
              {config.ogImageUrl ? (
                <img
                  src={config.ogImageUrl}
                  alt=""
                  className="w-full h-32 object-cover bg-dark/5"
                />
              ) : (
                <div className="w-full h-32 bg-dark/5 flex items-center justify-center">
                  <TbPhoto size={28} className="text-dark/20" />
                </div>
              )}
              <div className="p-3 flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-wide text-dark/40">linkkk.dev</span>
                <span className="text-sm font-semibold text-dark truncate">{previewTitle}</span>
                {previewDescription && (
                  <span className="text-xs text-dark/50 line-clamp-2">{previewDescription}</span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
