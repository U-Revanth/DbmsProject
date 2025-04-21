import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const carId = params.carId;
    console.log('Fetching reviews for car:', carId);
    
    // First check if the car exists
    const car = await prisma.car.findUnique({
      where: { car_id: carId }
    });
    
    if (!car) {
      console.log('Car not found:', carId);
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }
    
    console.log('Car found:', car);

    const reviews = await prisma.review.findMany({
      where: {
        car_id: carId
      },
      orderBy: {
        review_id: 'desc'
      }
    });

    console.log('Found reviews:', reviews);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error.message },
      { status: 500 }
    );
  }
} 