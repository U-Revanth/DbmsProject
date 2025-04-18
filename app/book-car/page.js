'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { DateRange } from 'react-date-range';

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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState([{ startDate: new Date(), endDate: new Date() }]);

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

  const handleDateSelect = (ranges) => {
    setDateRange(ranges);
    setPickupDate(ranges[0].startDate.toISOString().split('T')[0]);
    setReturnDate(ranges[0].endDate.toISOString().split('T')[0]);
    setIsDatePickerOpen(false);
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Book a Car</h1>
        <p className="text-gray-600 text-lg mb-8">Select your preferred car and dates</p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Garage Selection */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Garage</h2>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-100 rounded-lg"></div>
              </div>
            ) : (
              <select
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available Cars</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {cars.length > 0 ? (
                  cars.map((car) => (
                    <div
                      key={car.plate_id}
                      className={`p-6 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedCar === car.plate_id 
                          ? 'bg-gray-50 border-gray-300 shadow-sm' 
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                      onClick={() => setSelectedCar(car.plate_id)}
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{car.model} {car.make}</h3>
                      <div className="space-y-1">
                        <p className="text-gray-600">Year: {car.year}</p>
                        <p className="text-gray-600">Price per day: ${car.price_per_day}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center">No cars available in this garage</p>
                )}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Dates</h2>
            <div className="mb-4">
              <button
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {dateRange[0].startDate && dateRange[0].endDate
                  ? `${format(dateRange[0].startDate, 'MMM dd, yyyy')} - ${format(dateRange[0].endDate, 'MMM dd, yyyy')}`
                  : 'Select Dates'}
              </button>
            </div>

            {isDatePickerOpen && (
              <div className="absolute z-10 bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                <DateRange
                  ranges={dateRange}
                  onChange={handleDateSelect}
                  minDate={new Date()}
                />
              </div>
            )}

            {error && (
              <div className="text-red-600 mb-4">{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 