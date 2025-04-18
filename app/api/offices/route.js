import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Starting offices API request...');
    
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

    console.log('Fetching offices...');
    const offices = await prisma.office.findMany({
      select: {
        office_id: true,
        name: true,
        city: true,
        country: true,
        building_no: true,
        email: true,
        phone_no: true,
      },
    });

    console.log(`Found ${offices.length} offices`);
    console.log('Sample office data:', offices[0]);

    if (!offices || offices.length === 0) {
      console.log('No offices found in the database');
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(offices);
  } catch (error) {
    console.error('Error in offices API:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return NextResponse.json(
      { 
        error: 'Failed to fetch offices',
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