import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const bookings = await prisma.reservation.findMany({
      where: {
        car_id: params.carId,
        status: 'confirmed',
      },
      select: {
        pickup_date: true,
        return_date: true,
      },
      orderBy: {
        pickup_date: 'asc',
      },
    });

    return NextResponse.json({
      bookings: bookings.map(booking => ({
        pickup_date: new Date(booking.pickup_date).toISOString(),
        return_date: new Date(booking.return_date).toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
} 