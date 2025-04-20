import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    console.log('Starting cancellation process...');
    const reservationId = parseInt(params.id);
    
    if (isNaN(reservationId)) {
      return NextResponse.json(
        { error: 'Invalid reservation ID' },
        { status: 400 }
      );
    }

    // First get the reservation to get the car_id
    const reservation = await prisma.reservation.findUnique({
      where: { reservation_id: reservationId },
      select: {
        car_id: true,
        status: true
      }
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    console.log('Found reservation:', reservation);

    // Start a transaction to update both the reservation and car status
    const result = await prisma.$transaction(async (prisma) => {
      // Update the reservation status to cancelled
      const updatedReservation = await prisma.reservation.update({
        where: { reservation_id: reservationId },
        data: { status: 'cancelled' },
        select: {
          reservation_id: true,
          status: true,
          car: {
            select: {
              car_id: true,
              make: true,
              model: true,
              status: true
            }
          }
        }
      });

      console.log('Updated reservation:', updatedReservation);

      // Update the car status back to available
      const updatedCar = await prisma.car.update({
        where: { car_id: reservation.car_id },
        data: { status: 'available' },
        select: {
          car_id: true,
          status: true
        }
      });

      console.log('Updated car status:', updatedCar);

      return updatedReservation;
    });

    return NextResponse.json({
      success: true,
      reservation: result
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return NextResponse.json(
      { error: 'Failed to cancel reservation', details: error.message },
      { status: 500 }
    );
  }
} 