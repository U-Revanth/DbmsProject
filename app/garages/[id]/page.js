'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

export default function GarageCars({ params }) {
  const { data: session, status } = useSession();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/garages/${params.id}/cars`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch cars');
        }
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server');
        }
        
        console.log('Received cars:', data);
        setCars(data);
      } catch (err) {
        console.error('Error fetching cars:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [params.id]);

  const handleBookNow = (carId) => {
    if (!session) {
      router.push('/api/auth/signin?callbackUrl=' + encodeURIComponent(`/garages/${params.id}/cars/${carId}`));
      return;
    }
    router.push(`/garages/${params.id}/cars/${carId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Cars</h2>
            <p className="text-red-600">{error}</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Back to Garages
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Cars</h1>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Garages
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div
              key={car.car_id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {car.make} {car.model}
                  </h2>
                  <p className="text-gray-600">Year: {car.year}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per day</span>
                  <span className="text-lg font-semibold text-gray-900">
                    ₹{car.price_per_day}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    car.status === 'available' ? 'bg-green-100 text-green-800' :
                    car.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {car.status}
                  </span>
                </div>

                <Button
                  onClick={() => handleBookNow(car.car_id)}
                  disabled={car.status !== 'available'}
                  className="w-full"
                >
                  {car.status === 'available' 
                    ? (session ? 'Book Now' : 'Sign in to Book') 
                    : 'Unavailable'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {cars.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No cars available in this garage</p>
          </div>
        )}
      </div>
    </div>
  );
} 