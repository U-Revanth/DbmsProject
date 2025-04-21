import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { car_id, rating, comment } = await request.json();

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if the user has completed a ride for this car
    const completedRide = await prisma.reservation.findFirst({
      where: {
        user_id: session.user.id,
        car_id: car_id,
        status: 'completed',
        return_date: {
          lte: new Date() // Ride has ended
        }
      }
    });

    if (!completedRide) {
      return NextResponse.json(
        { error: 'You can only review cars you have completed rides with' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this car
    const existingReview = await prisma.review.findFirst({
      where: {
        user_id: session.user.id,
        car_id: car_id
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this car' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        user_id: session.user.id,
        car_id: car_id,
        rating: rating,
        comment: comment,
        review_date: new Date()
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review', details: error.message },
      { status: 500 }
    );
  }
} 