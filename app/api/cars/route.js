import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    console.log('Starting cars API request...');
    
    const { searchParams } = new URL(request.url);
    const garageId = searchParams.get('garageId') || searchParams.get('officeId');
    console.log('Received garageId:', garageId);

    if (!garageId) {
      return NextResponse.json(
        { error: 'Garage ID is required' },
        { status: 400 }
      );
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (connectError) {
      console.error('Database connection error:', connectError);
      throw new Error(`Database connection failed: ${connectError.message}`);
    }

    // First, try to find the garage by name and city if the ID is a string
    let garage;
    if (isNaN(garageId)) {
      const [name, city] = garageId.split(' - ');
      console.log('Looking up garage by name and city:', { name, city });
      
      garage = await prisma.garage.findFirst({
        where: {
          name: name,
          city: city
        }
      });

      if (!garage) {
        return NextResponse.json(
          { error: 'Garage not found' },
          { status: 404 }
        );
      }
    }

    console.log('Fetching cars for garage:', garageId);
    const cars = await prisma.car.findMany({
      where: {
        garage_id: garage ? garage.garage_id : parseInt(garageId),
      },
      select: {
        car_id: true,
        model: true,
        make: true,
        year: true,
        price_per_day: true,
        status: true,
        garage: {
          select: {
            name: true,
            city: true
          }
        }
      }
    });

    console.log(`Found ${cars.length} cars`);
    console.log('Sample car data:', cars[0]);

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error in cars API:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch cars',
        details: error.message,
        type: error.name
      },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
      console.log('Database connection closed');
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
} 