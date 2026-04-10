'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';

const links = [
  { href: '/users', label: 'Usuarios' },
  { href: '/posts', label: 'Posts' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // Si falla el logout en el server igual limpiamos la sesión local
    }
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <nav className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-gray-900">
            Portal
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname.startsWith(link.href)
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Salir
        </Button>
      </div>
    </header>
  );
}
