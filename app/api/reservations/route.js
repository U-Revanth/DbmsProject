import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        user_id: userId,
      },
      include: {
        car: {
          include: {
            office: {
              select: {
                name: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy: {
        pickup_date: 'desc',
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { car_id, pickup_date, return_date, total_price } = await request.json();

    // Check if the car exists and is available
    const car = await prisma.car.findUnique({
      where: { car_id },
      include: {
        reservation: {
          where: {
            status: 'confirmed',
            OR: [
              {
                pickup_date: {
                  lte: new Date(return_date),
                },
                return_date: {
                  gte: new Date(pickup_date),
                },
              },
            ],
          },
        },
      },
    });

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    if (car.status !== 'available') {
      return NextResponse.json(
        { error: 'Car is not available for reservation' },
        { status: 400 }
      );
    }

    if (car.reservation.length > 0) {
      return NextResponse.json(
        { error: 'Car is already reserved for the selected dates' },
        { status: 400 }
      );
    }

    // Create the reservation
    const reservation = await prisma.reservation.create({
      data: {
        user_id: session.user.id,
        car_id,
        pickup_date: new Date(pickup_date),
        return_date: new Date(return_date),
        total_price,
        status: 'confirmed',
      },
    });

    // Update car status
    await prisma.car.update({
      where: { car_id },
      data: { status: 'rented' },
    });

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
} 