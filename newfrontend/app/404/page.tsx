"use client";
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/app/components/ui/Button/Button';
import { TbHome, TbAlertTriangle } from 'react-icons/tb';

export default function NotFoundPage() {
  const searchParams = useSearchParams();
  const shortUrl = searchParams.get('url');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark/5 to-info/10">
      <div className="max-w-md w-full bg-light rounded-3xl shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
          <TbAlertTriangle size={48} className="text-warning" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black italic mb-4">Link Not Found</h1>

        {/* Description */}
        <p className="text-dark/70 mb-6">
          {shortUrl ? (
            <>
              The short link <span className="font-bold text-dark">/{shortUrl}</span> doesn't exist or has been deleted.
            </>
          ) : (
            "The link you're looking for doesn't exist or has been deleted."
          )}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button
              variant="solid"
              size="md"
              rounded="2xl"
              leftIcon={<TbHome size={20} />}
              className="w-full bg-info hover:bg-info/80"
            >
              Go to Home
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button
              variant="outline"
              size="md"
              rounded="2xl"
              className="w-full border-dark/20 text-dark/70 hover:bg-dark/5"
            >
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-dark/10">
          <p className="text-sm text-dark/50">
            Powered by <span className="font-black italic">Linkkk</span>
          </p>
        </div>
      </div>
    </div>
  );
}
