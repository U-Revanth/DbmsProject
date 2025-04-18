import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reservationId = parseInt(params.id);
    
    // Check if the reservation exists and belongs to the user
    const reservation = await prisma.reservation.findUnique({
      where: {
        reservation_id: reservationId,
        user_id: session.user.id,
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Update the reservation status to cancelled
    const updatedReservation = await prisma.reservation.update({
      where: {
        reservation_id: reservationId,
      },
      data: {
        status: 'cancelled',
      },
    });

    // Update the car status back to available
    await prisma.car.update({
      where: {
        car_id: reservation.car_id,
      },
      data: {
        status: 'available',
      },
    });

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return NextResponse.json(
      { error: 'Failed to cancel reservation' },
      { status: 500 }
    );
  }
} 