import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, { params }) {
  try {
    const reservationId = parseInt(params.id);
    
    if (isNaN(reservationId)) {
      return NextResponse.json(
        { error: 'Invalid reservation ID' },
        { status: 400 }
      );
    }

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
            model: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return NextResponse.json(
      { error: 'Failed to cancel reservation', details: error.message },
      { status: 500 }
    );
  }
} 