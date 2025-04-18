import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const garageId = parseInt(params.id);
    
    const cars = await prisma.car.findMany({
      where: {
        garage_id: garageId,
      },
      include: {
        reservation: {
          where: {
            status: 'confirmed',
          },
          select: {
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

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
} 