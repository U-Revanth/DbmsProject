'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function GarageCars({ params }) {
  const resolvedParams = use(params);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCars();
  }, [resolvedParams.id]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/garages/${resolvedParams.id}/cars`);
      const data = await response.json();
      
      if (response.ok) {
        setCars(data);
      } else {
        setError(data.error || 'Failed to fetch cars');
      }
    } catch (err) {
      setError('Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Available Cars</h1>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Back to Garages
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div
              key={car.car_id}
              className={`bg-white p-6 rounded-lg shadow-md ${
                car.status === 'maintenance' ? 'bg-black text-white' : ''
              }`}
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold">
                  {car.make} {car.model}
                </h2>
                <p className={car.status === 'maintenance' ? 'text-gray-300' : 'text-gray-600'}>
                  Year: {car.year}
                </p>
                <p className={car.status === 'maintenance' ? 'text-gray-300' : 'text-gray-600'}>
                  Price per day: ${Number(car.price_per_day).toFixed(2)}
                </p>
                {car.status === 'maintenance' && (
                  <p className="text-red-400 font-semibold mt-2">
                    Under Maintenance
                  </p>
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={() => router.push(`/garages/${resolvedParams.id}/cars/${car.car_id}`)}
                  className={`w-full px-4 py-2 rounded ${
                    car.status === 'maintenance'
                      ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  disabled={car.status === 'maintenance'}
                >
                  {car.status === 'maintenance' ? 'Unavailable' : 'Book Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
} 