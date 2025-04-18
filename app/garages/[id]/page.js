'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';

export default function GaragePage({ params }) {
  const resolvedParams = use(params);
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchCars();
  }, [resolvedParams.id]);

  const fetchCars = async () => {
    try {
      const response = await fetch(`/api/cars?garageId=${resolvedParams.id}`);
      const data = await response.json();
      if (response.ok) {
        setCars(data);
      } else {
        setError(data.error || 'Failed to fetch cars');
      }
    } catch (err) {
      setError('Failed to fetch cars');
    }
  };

  const handleCarSelect = (car) => {
    setSelectedCar(car);
    router.push(`/garages/${resolvedParams.id}/cars/${car.car_id}`);
  };

  return (
    <main className="min-h-screen p-8">
      <button
        onClick={() => router.back()}
        className="mb-8 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back to Garages
      </button>

      <h1 className="text-3xl font-bold mb-8">Available Cars</h1>
      
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div
            key={car.car_id}
            className={`p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer ${
              car.status !== 'available' ? 'opacity-50' : ''
            }`}
            onClick={() => car.status === 'available' && handleCarSelect(car)}
          >
            <h2 className="text-xl font-semibold mb-2">{car.make} {car.model}</h2>
            <p className="text-gray-600">Year: {car.year}</p>
            <p className="text-gray-600">Price per day: ${car.price_per_day}</p>
            <p className={`font-semibold ${
              car.status === 'available' ? 'text-green-600' : 'text-red-600'
            }`}>
              Status: {car.status}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
} 