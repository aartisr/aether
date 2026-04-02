import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-extrabold text-indigo-800">Page not found</h1>
      <p className="mt-3 text-gray-600 max-w-xl">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="px-5 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Go to homepage
        </Link>
      </div>
    </section>
  );
}
