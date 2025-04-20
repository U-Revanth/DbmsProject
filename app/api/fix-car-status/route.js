import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    console.log('Starting car status fix...');

    // Get all cars that are marked as rented
    const rentedCars = await prisma.car.findMany({
      where: {
        status: 'rented'
      },
      select: {
        car_id: true,
        status: true
      }
    });

    console.log(`Found ${rentedCars.length} cars marked as rented`);

    // For each rented car, check if it has any active reservations
    for (const car of rentedCars) {
      const activeReservations = await prisma.reservation.findMany({
        where: {
          car_id: car.car_id,
          status: 'confirmed',
          return_date: {
            gte: new Date() // Only check reservations that haven't ended yet
          }
        }
      });

      console.log(`Car ${car.car_id} has ${activeReservations.length} active reservations`);

      // If no active reservations, update status to available
      if (activeReservations.length === 0) {
        await prisma.car.update({
          where: { car_id: car.car_id },
          data: { status: 'available' }
        });
        console.log(`Updated car ${car.car_id} to available`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Car statuses have been fixed'
    });
  } catch (error) {
    console.error('Error fixing car statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fix car statuses', details: error.message },
      { status: 500 }
    );
  }
} 