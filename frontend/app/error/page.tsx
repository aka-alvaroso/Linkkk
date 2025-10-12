"use client";
import Link from 'next/link';
import Button from '@/app/components/ui/Button/Button';
import { TbHome, TbAlertCircle } from 'react-icons/tb';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark/5 to-danger/10">
      <div className="max-w-md w-full bg-light rounded-3xl shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-danger/10 flex items-center justify-center">
          <TbAlertCircle size={48} className="text-danger" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black italic mb-4">Something Went Wrong</h1>

        {/* Description */}
        <p className="text-dark/70 mb-6">
          An unexpected error occurred while processing your request. Please try again later.
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

          <Button
            variant="outline"
            size="md"
            rounded="2xl"
            className="w-full border-dark/20 text-dark/70 hover:bg-dark/5"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
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
