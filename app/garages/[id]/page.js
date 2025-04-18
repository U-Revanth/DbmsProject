'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Car, Calendar, Wrench } from 'lucide-react';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Available Cars</h1>
            <p className="text-lg text-gray-600">Select a car to start your booking</p>
          </div>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="border-gray-900 text-gray-900 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Garages
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => (
            <div
              key={car.car_id}
              className={`bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md ${
                car.status === 'maintenance' ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-center mb-6">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mr-4 ${
                  car.status === 'maintenance' ? 'bg-gray-100' : 'bg-gray-50'
                }`}>
                  {car.status === 'maintenance' ? (
                    <Wrench className="w-7 h-7 text-gray-900" />
                  ) : (
                    <Car className="w-7 h-7 text-gray-900" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {car.make} {car.model}
                  </h2>
                  <p className="text-gray-600">Year: {car.year}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per day</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ${Number(car.price_per_day).toFixed(2)}
                  </span>
                </div>
                {car.status === 'maintenance' && (
                  <div className="flex items-center text-red-500">
                    <Wrench className="w-4 h-4 mr-2" />
                    <span className="font-medium">Under Maintenance</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => router.push(`/garages/${resolvedParams.id}/cars/${car.car_id}`)}
                disabled={car.status === 'maintenance'}
                className={`w-full ${
                  car.status === 'maintenance'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {car.status === 'maintenance' ? 'Unavailable' : 'Book Now'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 