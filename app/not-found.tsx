import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-scrapbook-50">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-scrapbook-900 mb-4">404</h2>
        <p className="text-scrapbook-600 mb-6">Page not found</p>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-scrapbook-700 text-white rounded-lg hover:bg-scrapbook-800"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
