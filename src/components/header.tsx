'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export function Header() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const pathname = usePathname();

  const userName = session?.user?.name || 'User';
  const userEmail = session?.user?.email || '';
  const userInitial = userName.charAt(0).toUpperCase();

  const userRole = session?.user?.role;

  const navLinkClass = (href: string) => {
    const isActive =
      href === '/'
        ? pathname === '/'
        : pathname.startsWith(href);

    return `text-sm font-medium transition ${
      isActive
        ? 'border-b-2 border-blue-400 pb-1 text-blue-400'
        : 'text-slate-300 hover:text-blue-400'
    }`;
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-8">

          {/* LOGO */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.jpg"
              alt="Auto Kamp Miris Ljeta"
              width={70}
              height={70}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* MAIN NAVIGATION */}
          <nav className="flex items-center gap-6">

            <Link
              href="/"
              className={navLinkClass('/')}
            >
              Home
            </Link>

            <Link
              href="/accommodation"
              className={navLinkClass('/accommodation')}
            >
              Accommodation
            </Link>

            <Link
  href="/map"
  className={navLinkClass('/map')}
>
  Map
</Link>

<Link
  href="/cesium-map"
  className={navLinkClass('/cesium-map')}
>
  3D Map
</Link>

<Link
  href="/smart-search"
  className={navLinkClass('/smart-search')}
>
  Smart Search
</Link>
            <Link
              href="/my-favorites"
              className={navLinkClass('/my-favorites')}
            >
              My Favorites
            </Link>

          </nav>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative flex items-center">

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white transition hover:bg-slate-700"
          >
            {userInitial}
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-64 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-xl">

              {/* USER INFO */}
              <p className="text-sm font-semibold text-white">
                {userName}
              </p>

              {userEmail && (
                <p className="mt-1 truncate text-xs text-slate-400">
                  {userEmail}
                </p>
              )}

              {userRole && (
                <p className="mt-1 text-xs text-blue-400">
                  {userRole}
                </p>
              )}

              <div className="my-3 border-t border-slate-700" />

              {/* PROFILE */}
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                My Profile
              </Link>

              {/* RESERVATIONS */}
              <Link
                href="/my-reservations"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                My Reservations
              </Link>

              {/* FAVORITES */}
              <Link
                href="/my-favorites"
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                My Favorites
              </Link>

              {/* PROVIDER */}
              {userRole === 'PROVIDER' && (
                <>
                  <div className="my-2 border-t border-slate-700" />

                  <Link
                    href="/provider/dashboard"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                  >
                    Provider Dashboard
                  </Link>

                  <Link
                    href="/provider/camp/spatial-settings"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                  >
                    Spatial Settings
                  </Link>
                </>
              )}

              {/* ADMIN */}
              {userRole === 'ADMIN' && (
                <>
                  <div className="my-2 border-t border-slate-700" />

                  <Link
                    href="/admin/dashboard"
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
                  >
                    Admin Dashboard
                  </Link>
                </>
              )}

              {/* LOGOUT */}
              {session?.user && (
                <>
                  <div className="my-2 border-t border-slate-700" />

                  <button
                    type="button"
                  onClick={() =>
  signOut({
    callbackUrl: '/login',
  })
}
                    className="w-full rounded-md px-3 py-2 text-left text-sm text-red-300 hover:bg-slate-800"
                  >
                    Sign out
                  </button>
                </>
              )}

            </div>
          )}
        </div>
      </div>
    </header>
  );
}