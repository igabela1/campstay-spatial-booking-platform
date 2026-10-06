'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';

type FavoriteListing = {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  price: number;
  capacity: number;
  isAvailable: boolean;
  camp: {
    id: string;
    name: string;
  } | null;
  photos: {
    id: string;
    url: string;
    isCover: boolean;
  }[];
};

type BookmarkItem = {
  id: string;
  listing: FavoriteListing;
};

export default function MyFavoritesPage() {
  const { data: session, status } = useSession();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/bookmarks/user?email=${encodeURIComponent(session.user.email)}`
        );

        const data = await response.json();

        if (response.ok) {
          setBookmarks(data.bookmarks || []);
        } else {
          console.error(data.error || 'Failed to load favorites');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      fetchFavorites();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [session?.user?.email, status]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-background pb-10 pt-28">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <p className="mt-2 text-muted-foreground">
              Saved accommodations you can revisit anytime.
            </p>
          </div>

          {status === 'loading' || loading ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Loading favorites...</p>
              </CardContent>
            </Card>
          ) : status === 'unauthenticated' ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  You need to log in to view your favorites.
                </p>

                <Link
                  href="/login"
                  className="mt-4 inline-block text-sm text-primary underline"
                >
                  Go to login
                </Link>
              </CardContent>
            </Card>
          ) : bookmarks.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  You do not have any saved favorites yet.
                </p>

                <Link
                  href="/search"
                  className="mt-4 inline-block text-sm text-primary underline"
                >
                  Browse accommodations
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {bookmarks.map((bookmark) => {
                const listing = bookmark.listing;
                const mainImage = listing.photos?.[0]?.url ?? null;

                return (
                  <Card key={bookmark.id} className="overflow-hidden">
                    {mainImage && (
                      <img
                        src={mainImage}
                        alt={listing.title}
                        className="h-56 w-full object-cover"
                      />
                    )}

                    <CardContent className="space-y-3 p-5">
                      <div>
                        <h2 className="text-xl font-semibold">{listing.title}</h2>
                        <p className="text-sm text-muted-foreground">
                          {listing.city}, {listing.address}
                        </p>

                        {listing.camp && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Camp: {listing.camp.name}
                          </p>
                        )}
                      </div>

                      <div className="grid gap-2 text-sm">
                        <p>
                          <span className="font-medium">Price:</span> {listing.price} KM / night
                        </p>
                        <p>
                          <span className="font-medium">Capacity:</span> {listing.capacity} guests
                        </p>
                        <p>
                          <span className="font-medium">Availability:</span>{' '}
                          {listing.isAvailable ? 'Available' : 'Not available'}
                        </p>
                      </div>

                      <Link
                        href={`/listing/${listing.id}`}
                        className="inline-block text-sm text-primary underline"
                      >
                        View details
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}