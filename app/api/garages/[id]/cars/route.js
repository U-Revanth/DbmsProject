import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  const garageId = parseInt(params.id);
  
  if (isNaN(garageId)) {
    return NextResponse.json(
      { error: 'Invalid garage ID' },
      { status: 400 }
    );
  }

  try {
    // Connect to database
    await prisma.$connect();

    // Check if garage exists
    const garage = await prisma.garage.findUnique({
      where: { garage_id: garageId }
    });

    if (!garage) {
      return NextResponse.json(
        { error: 'Garage not found' },
        { status: 404 }
      );
    }

    // Get cars for the garage
    const cars = await prisma.car.findMany({
      where: { garage_id: garageId },
      select: {
        car_id: true,
        model: true,
        make: true,
        year: true,
        price_per_day: true,
        status: true,
        registration_date: true
      }
    });

    // Format the response
    const formattedCars = cars.map(car => ({
      ...car,
      price_per_day: Number(car.price_per_day),
      registration_date: car.registration_date?.toISOString() || null
    }));

    return NextResponse.json(formattedCars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 