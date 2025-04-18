'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

export default function MyBookings() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reservations');
      const data = await response.json();
      
      if (response.ok) {
        setBookings(data);
      } else {
        setError(data.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Refresh the bookings list
        await fetchBookings();
        // Show success message
        alert('Reservation cancelled successfully!');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to cancel reservation');
      }
    } catch (err) {
      setError('Failed to cancel reservation');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to view your bookings.</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Back to Home
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No bookings found</h2>
            <p className="text-gray-600 mb-4">You haven't made any reservations yet.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Book a Car
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.reservation_id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      {booking.car.make} {booking.car.model}
                    </h2>
                    <p className="text-gray-600">Year: {booking.car.year}</p>
                    <p className="text-gray-600">
                      Location: {booking.car.garage.name}, {booking.car.garage.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      Pickup: {format(new Date(booking.pickup_date), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-gray-600">
                      Return: {format(new Date(booking.return_date), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-gray-600">
                      Total Price: ${Number(booking.total_price).toFixed(2)}
                    </p>
                    <p className={`font-semibold ${
                      booking.status === 'confirmed' ? 'text-green-600' :
                      booking.status === 'cancelled' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      Status: {booking.status}
                    </p>
                  </div>
                </div>
                {booking.status === 'confirmed' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleCancel(booking.reservation_id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Cancel Reservation
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 