'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function CarBookingPage({ params }) {
  const resolvedParams = use(params);
  const [car, setCar] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCar();
  }, [resolvedParams.carId]);

  const fetchCar = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cars/${resolvedParams.carId}`);
      const data = await response.json();
      if (response.ok) {
        setCar(data);
      } else {
        setError(data.error || 'Failed to fetch car details');
      }
    } catch (err) {
      setError('Failed to fetch car details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!pickupDate || !returnDate) {
      setError('Please select both pickup and return dates');
      return;
    }

    const startDate = new Date(pickupDate);
    const endDate = new Date(returnDate);

    if (startDate >= endDate) {
      setError('Return date must be after pickup date');
      return;
    }

    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalPrice = days * car.price_per_day;

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          car_id: car.car_id,
          pickup_date: startDate,
          return_date: endDate,
          total_price: totalPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to make reservation');
      }

      alert('Reservation successful!');
      router.push('/my-bookings');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Car not found</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <button
        onClick={() => router.back()}
        className="mb-8 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back to Cars
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Book {car.make} {car.model}</h1>
        
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Car Details</h2>
            <p className="text-gray-600">Year: {car.year}</p>
            <p className="text-gray-600">Price per day: ${car.price_per_day}</p>
            <p className="text-gray-600">Status: {car.status}</p>
            <p className="text-gray-600">Location: {car.garage.name}, {car.garage.city}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Select Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          {pickupDate && returnDate && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Booking Summary</h2>
              <p className="text-gray-600">
                Total Days: {Math.ceil((new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24))}
              </p>
              <p className="text-gray-600">
                Total Price: ${(Math.ceil((new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)) * car.price_per_day).toFixed(2)}
              </p>
            </div>
          )}

          <button
            onClick={handleBooking}
            className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={!pickupDate || !returnDate}
          >
            Book Now
          </button>
        </div>
      </div>
    </main>
  );
} 