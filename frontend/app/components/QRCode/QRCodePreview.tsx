'use client';

import React, { useEffect, useRef } from 'react';
import QRCodeStyling, {
  type DotType,
  type CornerSquareType,
} from 'qr-code-styling';
import type { QRConfig, DotsStyle, CornersStyle } from '@/app/types/qr';

interface QRCodePreviewProps {
  url: string;
  config: QRConfig;
  size?: number;
}

// Map our style types to qr-code-styling types
const dotsStyleMap: Record<DotsStyle, DotType> = {
  square: 'square',
  rounded: 'rounded',
  dots: 'dots',
};

const cornersStyleMap: Record<CornersStyle, CornerSquareType> = {
  square: 'square',
  rounded: 'extra-rounded',
};

export default function QRCodePreview({
  url,
  config,
  size = 200,
}: QRCodePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  // Initialize QR code
  useEffect(() => {
    if (!containerRef.current) return;

    qrCodeRef.current = new QRCodeStyling({
      width: size,
      height: size,
      data: url,
      dotsOptions: {
        color: config.foregroundColor,
        type: dotsStyleMap[config.dotsStyle],
      },
      cornersSquareOptions: {
        color: config.foregroundColor,
        type: cornersStyleMap[config.cornersStyle],
      },
      cornersDotOptions: {
        color: config.foregroundColor,
      },
      backgroundOptions: {
        color: config.backgroundColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 5,
        imageSize: config.logoSize,
      },
      image: config.logoUrl || undefined,
      qrOptions: {
        errorCorrectionLevel: 'M',
      },
    });

    // Clear container and append QR code
    containerRef.current.innerHTML = '';
    qrCodeRef.current.append(containerRef.current);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [url, size]);

  // Update QR code when config changes
  useEffect(() => {
    if (!qrCodeRef.current) return;

    qrCodeRef.current.update({
      data: url,
      dotsOptions: {
        color: config.foregroundColor,
        type: dotsStyleMap[config.dotsStyle],
      },
      cornersSquareOptions: {
        color: config.foregroundColor,
        type: cornersStyleMap[config.cornersStyle],
      },
      cornersDotOptions: {
        color: config.foregroundColor,
      },
      backgroundOptions: {
        color: config.backgroundColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 5,
        imageSize: config.logoSize,
      },
      image: config.logoUrl || undefined,
    });
  }, [url, config]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: config.backgroundColor,
      }}
    />
  );
}

// Export a function to download the QR code
export async function downloadQRCode(
  url: string,
  config: QRConfig,
  filename: string = 'qrcode',
  size: number = 1000
): Promise<void> {
  const qrCode = new QRCodeStyling({
    width: size,
    height: size,
    data: url,
    dotsOptions: {
      color: config.foregroundColor,
      type: dotsStyleMap[config.dotsStyle],
    },
    cornersSquareOptions: {
      color: config.foregroundColor,
      type: cornersStyleMap[config.cornersStyle],
    },
    cornersDotOptions: {
      color: config.foregroundColor,
    },
    backgroundOptions: {
      color: config.backgroundColor,
    },
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: 5,
      imageSize: config.logoSize,
    },
    image: config.logoUrl || undefined,
    qrOptions: {
      errorCorrectionLevel: 'H', // Higher for downloads
    },
  });

  await qrCode.download({
    name: filename,
    extension: 'png',
  });
}
