import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connected successfully');

    // Test query to get all cars
    const cars = await prisma.car.findMany({
      take: 5, // Limit to 5 cars for testing
      select: {
        car_id: true,
        model: true,
        make: true,
        year: true,
        price_per_day: true,
        status: true,
        garage_id: true
      }
    });

    console.log('Found cars:', cars);

    return NextResponse.json({
      success: true,
      cars: cars
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 