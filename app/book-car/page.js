'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function BookCar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [garages, setGarages] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [cars, setCars] = useState([]);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchGarages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/garages');
        if (!response.ok) {
          throw new Error('Failed to fetch garages');
        }
        const data = await response.json();
        setGarages(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching garages:', error);
        setError('Failed to load garages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGarages();
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      if (selectedGarage) {
        try {
          setLoading(true);
          const response = await fetch(`/api/cars?officeId=${selectedGarage}`);
          if (!response.ok) {
            throw new Error('Failed to fetch cars');
          }
          const data = await response.json();
          setCars(data);
          setError(null);
        } catch (error) {
          console.error('Error fetching cars:', error);
          setError('Failed to load cars. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCars();
  }, [selectedGarage]);

  const handleBooking = async () => {
    if (!selectedCar || !pickupDate || !returnDate) {
      alert('Please select a car and specify pickup and return dates');
      return;
    }

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plateId: selectedCar,
          pickupDate,
          returnDate,
        }),
      });

      if (response.ok) {
        router.push('/my-bookings');
      } else {
        alert('Failed to create reservation');
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book a Car</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Garage Selection */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Select Garage</h2>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ) : (
              <select
                className="w-full p-2 border rounded-md"
                value={selectedGarage || ''}
                onChange={(e) => setSelectedGarage(e.target.value)}
              >
                <option value="">Select a garage</option>
                {garages.length > 0 ? (
                  garages.map((garage) => (
                    <option key={garage.office_id} value={garage.office_id}>
                      {garage.name} - {garage.city}
                    </option>
                  ))
                ) : (
                  <option disabled>No garages available</option>
                )}
              </select>
            )}
          </div>

          {/* Car Selection */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Available Cars</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {cars.length > 0 ? (
                  cars.map((car) => (
                    <div
                      key={car.plate_id}
                      className={`p-4 border rounded-md cursor-pointer ${
                        selectedCar === car.plate_id ? 'bg-blue-50 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedCar(car.plate_id)}
                    >
                      <h3 className="font-semibold">{car.model} {car.make}</h3>
                      <p className="text-gray-600">Year: {car.year}</p>
                      <p className="text-gray-600">Price per day: ${car.price_per_day}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center">No cars available in this garage</p>
                )}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Select Dates</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Pickup Date</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border rounded-md"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Return Date</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border rounded-md"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>
              <button
                onClick={handleBooking}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                disabled={!selectedCar || !pickupDate || !returnDate}
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 