'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [garages, setGarages] = useState([]);
  const [selectedGarage, setSelectedGarage] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchGarages();
  }, []);

  const fetchGarages = async () => {
    try {
      const response = await fetch('/api/garages');
      const data = await response.json();
      if (response.ok) {
        setGarages(data);
      } else {
        setError(data.error || 'Failed to fetch garages');
      }
    } catch (err) {
      setError('Failed to fetch garages');
    }
  };

  const handleGarageSelect = (garage) => {
    setSelectedGarage(garage);
    router.push(`/garages/${garage.garage_id}`);
  };

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Select a Garage</h1>
      
      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {garages.map((garage) => (
          <div
            key={garage.garage_id}
            className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleGarageSelect(garage)}
          >
            <h2 className="text-xl font-semibold mb-2">{garage.name}</h2>
            <p className="text-gray-600">{garage.address}</p>
            <p className="text-gray-600">{garage.city}, {garage.country}</p>
            {garage.phone && <p className="text-gray-600">Phone: {garage.phone}</p>}
          </div>
        ))}
      </div>
    </main>
  );
}
