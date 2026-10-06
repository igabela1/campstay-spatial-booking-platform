'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

type BookmarkButtonProps = {
  listingId: string;
};

export function BookmarkButton({ listingId }: BookmarkButtonProps) {
  const { status } = useSession();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkBookmark = async () => {
      try {
        const response = await fetch('/api/bookmarks/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listingId,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setIsBookmarked(data.isBookmarked);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (status === 'authenticated') {
      checkBookmark();
    }
  }, [listingId, status]);

  const handleToggleBookmark = async () => {
    if (status !== 'authenticated') {
      alert('You need to log in first.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/bookmarks', {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      } else {
        alert(data.error || 'Failed to update favorites.');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <Button disabled className="w-full">
        Loading...
      </Button>
    );
  }

  return (
    <Button
      onClick={handleToggleBookmark}
      disabled={loading}
      variant={isBookmarked ? 'secondary' : 'default'}
      className="w-full"
    >
      {isBookmarked ? 'Remove from favorites' : 'Save to favorites'}
    </Button>
  );
}