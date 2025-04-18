import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Starting garages API request...');
    
    // Log database URL (without password)
    const dbUrl = process.env.DATABASE_URL;
    console.log('Database URL:', dbUrl ? dbUrl.replace(/\/\/[^@]+@/, '//****:****@') : 'Not set');

    // Test database connection first
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (connectError) {
      console.error('Database connection error:', connectError);
      throw new Error(`Database connection failed: ${connectError.message}`);
    }

    console.log('Fetching garages...');
    const garages = await prisma.garage.findMany({
      select: {
        garage_id: true,
        name: true,
        address: true,
        city: true,
        state: true,
        country: true,
        latitude: true,
        longitude: true,
        phone: true,
      },
    });

    console.log(`Found ${garages.length} garages`);
    console.log('Sample garage data:', garages[0]);

    if (!garages || garages.length === 0) {
      console.log('No garages found in the database');
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(garages);
  } catch (error) {
    console.error('Error in garages API:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch garages',
        details: error.message,
        type: error.name
      },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
      console.log('Database connection closed');
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
} 