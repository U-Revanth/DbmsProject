'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { format, isWithinInterval, addDays, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, parseISO } from 'date-fns';

export default function CarBooking({ params }) {
  const resolvedParams = use(params);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [bookedDates, setBookedDates] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [maintenanceDates, setMaintenanceDates] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCar();
    fetchAllBookings();
  }, [resolvedParams.carId]);

  const fetchCar = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cars/${resolvedParams.carId}`);
      const data = await response.json();
      
      if (response.ok) {
        setCar(data);
        setUserBookings(data.reservations || []);
      } else {
        setError(data.error || 'Failed to fetch car details');
      }
    } catch (err) {
      setError('Failed to fetch car details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBookings = async () => {
    try {
      const response = await fetch(`/api/cars/${resolvedParams.carId}/bookings`);
      const data = await response.json();
      
      if (response.ok) {
        const allDates = data.bookings.map(res => ({
          start: parseISO(res.pickup_date),
          end: parseISO(res.return_date)
        }));
        setBookedDates(allDates);
      }
    } catch (err) {
      console.error('Failed to fetch all bookings');
    }
  };

  const isDateBooked = (date) => {
    return bookedDates.some(period => 
      isWithinInterval(date, { start: period.start, end: period.end })
    );
  };

  const isDateInMaintenance = (date) => {
    return maintenanceDates.some(period =>
      isWithinInterval(date, { start: period.start, end: period.end })
    );
  };

  const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(date, today);
  };

  const hasDateOverlap = (startDate, endDate) => {
    return bookedDates.some(period => {
      const periodStart = period.start;
      const periodEnd = period.end;
      return (
        (startDate >= periodStart && startDate <= periodEnd) ||
        (endDate >= periodStart && endDate <= periodEnd) ||
        (startDate <= periodStart && endDate >= periodEnd)
      );
    });
  };

  const generateMonthDays = (month) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    const startPadding = start.getDay();
    const paddedDays = Array(startPadding).fill(null).concat(days);

    return paddedDays.map(date => date ? {
      date,
      isBooked: isDateBooked(date),
      isMaintenance: isDateInMaintenance(date),
      isPast: isDateInPast(date),
      formattedDate: format(date, 'd'),
      isCurrentMonth: true,
    } : {
      date: null,
      isBooked: false,
      isMaintenance: false,
      isPast: false,
      formattedDate: '',
      isCurrentMonth: false,
    });
  };

  const handleDateSelect = (date) => {
    if (!date || isDateInMaintenance(date) || isDateInPast(date)) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    
    if (!pickupDate) {
      setPickupDate(dateStr);
      setError('');
    } else if (!returnDate) {
      if (new Date(dateStr) > new Date(pickupDate)) {
        // Check if the selected date range overlaps with any existing bookings
        if (hasDateOverlap(new Date(pickupDate), new Date(dateStr))) {
          setError('Selected dates overlap with existing bookings');
          return;
        }
        setReturnDate(dateStr);
        setError('');
      } else {
        setPickupDate(dateStr);
        setReturnDate('');
        setError('');
      }
    } else {
      setPickupDate(dateStr);
      setReturnDate('');
      setError('');
    }
  };

  const handleBooking = async () => {
    if (!pickupDate || !returnDate) {
      setError('Please select both pickup and return dates');
      return;
    }

    if (hasDateOverlap(new Date(pickupDate), new Date(returnDate))) {
      setError('Selected dates overlap with existing bookings');
      return;
    }

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          car_id: car.car_id,
          pickup_date: pickupDate,
          return_date: returnDate,
          total_price: calculateTotalPrice(),
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setError('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create reservation');
      }
    } catch (err) {
      setError('Failed to create reservation');
    }
  };

  const calculateTotalPrice = () => {
    if (!pickupDate || !returnDate) return 0;
    const days = Math.ceil(
      (new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)
    ) + 1;
    return days * Number(car.price_per_day);
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(addMonths(currentMonth, -1));
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

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h2>
            <p className="text-gray-600 mb-6">Your car has been reserved successfully.</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/my-bookings')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                View My Bookings
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Book {car.make} {car.model}</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            ← Back to Cars
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Car Details</h2>
              <p className="text-gray-600">Year: {car.year}</p>
              <p className="text-gray-600">
                Price per day: ${Number(car.price_per_day).toFixed(2)}
              </p>
              {car.status === 'maintenance' && (
                <p className="text-red-500 font-semibold mt-2">
                  This car is currently under maintenance
                </p>
              )}
              {userBookings && userBookings.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Your Upcoming Bookings:</h3>
                  {userBookings.map((res, index) => (
                    <p key={index} className="text-gray-600">
                      {format(parseISO(res.pickup_date), 'MMM dd')} - {format(parseISO(res.return_date), 'MMM dd')}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Select Dates</h2>
                <div className="flex gap-2">
                  <button
                    onClick={prevMonth}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    ←
                  </button>
                  <span className="font-semibold">
                    {format(currentMonth, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-sm mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold p-2">
                    {day}
                  </div>
                ))}
                {generateMonthDays(currentMonth).map((day, index) => (
                  <div
                    key={index}
                    onClick={() => handleDateSelect(day.date)}
                    className={`p-2 text-center rounded cursor-pointer ${
                      !day.date
                        ? 'bg-transparent'
                        : day.isPast
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : day.isMaintenance
                        ? 'bg-black text-white cursor-not-allowed'
                        : day.isBooked
                        ? 'bg-red-100 text-red-500 cursor-not-allowed'
                        : pickupDate === format(day.date, 'yyyy-MM-dd')
                        ? 'bg-blue-500 text-white'
                        : returnDate === format(day.date, 'yyyy-MM-dd')
                        ? 'bg-blue-500 text-white'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    }`}
                  >
                    {day.formattedDate}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {(pickupDate || returnDate) && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Pickup Date:</span>
                <span className="font-medium">{pickupDate ? format(new Date(pickupDate), 'MMMM d, yyyy') : 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Return Date:</span>
                <span className="font-medium">{returnDate ? format(new Date(returnDate), 'MMMM d, yyyy') : 'Not selected'}</span>
              </div>
              {pickupDate && returnDate && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Days:</span>
                    <span className="font-medium">
                      {Math.ceil((new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)) + 1} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per Day:</span>
                    <span className="font-medium">${Number(car.price_per_day).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-4">
                    <span className="text-lg font-semibold">Total Price:</span>
                    <span className="text-lg font-semibold text-blue-600">
                      ${calculateTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleBooking}
            disabled={!pickupDate || !returnDate || car.status === 'maintenance'}
            className={`px-6 py-3 rounded-md text-white font-semibold ${
              !pickupDate || !returnDate || car.status === 'maintenance'
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {car.status === 'maintenance' ? 'Car Under Maintenance' : 'Confirm Booking'}
          </button>
        </div>

        {success && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h2>
                <p className="text-gray-600 mb-6">Your car has been reserved successfully.</p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/my-bookings')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View My Bookings
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}