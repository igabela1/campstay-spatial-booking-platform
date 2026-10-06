import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-card">
      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-12 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Image
            src="/logo.jpg"
            alt="Auto Kamp Miris Ljeta"
            width={60}
            height={60}
            className="rounded-full object-cover"
          />
          <p className="text-sm text-muted-foreground">
            Digital platform for booking camping places, bungalows, apartments and small tourist
            accommodation near Jablanicko Lake.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
          <div>
            <h3 className="font-headline font-semibold text-foreground">For Guests</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/search" className="text-sm text-muted-foreground hover:text-primary">
                  Browse Accommodation
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-sm text-muted-foreground hover:text-primary">
                  View on Map
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-headline font-semibold text-foreground">For Providers</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/register/provider"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  List Your Camp
                </Link>
              </li>
              <li>
                <Link
                  href="/provider/dashboard"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                  Log In
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-headline font-semibold text-foreground">Platform</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-muted-foreground hover:text-primary">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/map" className="text-sm text-muted-foreground hover:text-primary">
                  Interactive Map
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Auto Kamp Miris Ljeta. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}