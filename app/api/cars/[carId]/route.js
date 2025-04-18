import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const car = await prisma.car.findUnique({
      where: {
        car_id: params.carId,
      },
      include: {
        garage: {
          select: {
            name: true,
            city: true,
          },
        },
        reservation: {
          where: {
            status: 'confirmed',
            user_id: session.user.id,
          },
          select: {
            reservation_id: true,
            pickup_date: true,
            return_date: true,
            status: true,
          },
          orderBy: {
            pickup_date: 'asc',
          },
        },
      },
    });

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    const response = {
      ...car,
      isAvailable: car.status !== 'maintenance',
      reservations: car.reservation.map(res => ({
        ...res,
        pickup_date: new Date(res.pickup_date).toISOString(),
        return_date: new Date(res.return_date).toISOString(),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching car:', error);
    return NextResponse.json(
      { error: 'Failed to fetch car details' },
      { status: 500 }
    );
  }
} 