'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/auth/login');
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link href="/admin" className="text-2xl font-bold text-blue-400">
            Admin Panel
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex gap-6 flex-wrap">
          <Link
            href="/admin"
            className="text-gray-300 hover:text-blue-400 font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="text-gray-300 hover:text-blue-400 font-medium"
          >
            Products
          </Link>
          <Link
            href="/admin/users"
            className="text-gray-300 hover:text-blue-400 font-medium"
          >
            Users
          </Link>
          <Link
            href="/admin/inventory"
            className="text-gray-300 hover:text-blue-400 font-medium"
          >
            Inventory
          </Link>
        </div>
      </div>
    </nav>
  );
}
