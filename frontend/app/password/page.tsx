"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/app/components/ui/Button/Button';
import { TbLock, TbHome } from 'react-icons/tb';
import Link from 'next/link';

export default function PasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);

  useEffect(() => {
    const urlParam = searchParams.get('url');
    setShortUrl(urlParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!shortUrl) {
      setError('No short URL provided');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/r/${shortUrl}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to the actual URL
        window.location.href = data.data.longUrl;
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!shortUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark/5 to-warning/10">
        <div className="max-w-md w-full bg-light rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
            <TbLock size={48} className="text-warning" />
          </div>
          <h1 className="text-4xl font-black italic mb-4">Invalid Link</h1>
          <p className="text-dark/70 mb-6">No URL was provided.</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark/5 to-warning/10">
      <div className="max-w-md w-full bg-light rounded-3xl shadow-2xl p-8">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
          <TbLock size={48} className="text-warning" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black italic mb-4 text-center">Password Required</h1>

        {/* Description */}
        <p className="text-dark/70 mb-6 text-center">
          This link is password protected. Please enter the password to continue.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="password" className="mb-2 font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="transition border-2 border-dark/25 text-dark rounded-2xl p-2 px-3 hover:outline-none focus:outline-none focus:border-2 focus:border-dark"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-danger/10 border border-danger/20 rounded-2xl p-3">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="solid"
            size="md"
            rounded="2xl"
            className="w-full bg-dark hover:bg-dark/80"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Submit'}
          </Button>
        </form>

        {/* Branding */}
        <div className="mt-6 text-center">
          <p className="text-sm text-dark/50">
            Powered by <span className="font-black italic">Linkkk</span>
          </p>
        </div>
      </div>
    </div>
  );
}
