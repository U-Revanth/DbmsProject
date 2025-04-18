'use client';

import { useState, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';

const CarCarousel = ({ cars, onReservation }) => {
  const [selectedCar, setSelectedCar] = useState(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [error, setError] = useState('');

  const handleDateSelect = (ranges) => {
    setDateRange([ranges.selection]);
    setIsDatePickerOpen(false);
  };

  const handleReservation = async () => {
    if (!selectedCar) {
      setError('Please select a car first');
      return;
    }

    const startDate = dateRange[0].startDate;
    const endDate = dateRange[0].endDate;

    if (!startDate || !endDate) {
      setError('Please select both pickup and return dates');
      return;
    }

    // Calculate total price
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const totalPrice = days * selectedCar.price_per_day;

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          car_id: selectedCar.car_id,
          pickup_date: startDate,
          return_date: endDate,
          total_price: totalPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to make reservation');
      }

      setError('');
      onReservation(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="overflow-x-auto whitespace-nowrap py-4">
        {cars.map((car) => (
          <div
            key={car.car_id}
            className={`inline-block w-64 mx-2 p-4 rounded-lg shadow-md cursor-pointer ${
              selectedCar?.car_id === car.car_id ? 'bg-blue-100' : 'bg-white'
            }`}
            onClick={() => setSelectedCar(car)}
          >
            <h3 className="text-lg font-semibold">{car.make} {car.model}</h3>
            <p className="text-gray-600">Year: {car.year}</p>
            <p className="text-gray-600">Price per day: ${car.price_per_day}</p>
            <p className="text-gray-600">Status: {car.status}</p>
          </div>
        ))}
      </div>

      {selectedCar && (
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Selected Car: {selectedCar.make} {selectedCar.model}</h3>
          
          <div className="mb-4">
            <button
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {dateRange[0].startDate && dateRange[0].endDate
                ? `${format(dateRange[0].startDate, 'MM/dd/yyyy')} - ${format(dateRange[0].endDate, 'MM/dd/yyyy')}`
                : 'Select Dates'}
            </button>
          </div>

          {isDatePickerOpen && (
            <div className="absolute z-10">
              <DateRange
                ranges={dateRange}
                onChange={handleDateSelect}
                minDate={new Date()}
              />
            </div>
          )}

          {error && (
            <div className="text-red-500 mb-4">{error}</div>
          )}

          <button
            onClick={handleReservation}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Make Reservation
          </button>
        </div>
      )}
    </div>
  );
};

export default CarCarousel; 