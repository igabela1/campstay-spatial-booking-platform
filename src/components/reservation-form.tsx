'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

type ReservationFormProps = {
  listingId: string;
};

const TEST_GUEST_USER_ID = 'cmnmuae6c0000wl7gjkqoomp4';

export function ReservationForm({ listingId }: ReservationFormProps) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReserve = async () => {
    try {
      setLoading(true);
      setMessage('');

      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: TEST_GUEST_USER_ID,
          listingId,
          checkIn,
          checkOut,
          guests,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage('Reservation successfully created.');
        setCheckIn('');
        setCheckOut('');
        setGuests(1);
      } else {
        setMessage(data.message || 'Reservation failed.');
      }
    } catch (error) {
      console.error(error);
      setMessage('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Check-in</label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Check-out</label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full rounded-md border bg-background px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Guests</label>
        <input
          type="number"
          min={1}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full rounded-md border bg-background px-3 py-2"
        />
      </div>

      <Button onClick={handleReserve} className="w-full" disabled={loading}>
        {loading ? 'Saving...' : 'Reserve now'}
      </Button>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}