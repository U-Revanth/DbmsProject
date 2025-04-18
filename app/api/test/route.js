import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Simple query to check connection
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Test query result:', testQuery);

    // Test 2: Count offices
    const officeCount = await prisma.office.count();
    console.log('Office count:', officeCount);

    // Test 3: Get first office
    const firstOffice = await prisma.office.findFirst();
    console.log('First office:', firstOffice);

    return NextResponse.json({
      status: 'success',
      testQuery,
      officeCount,
      firstOffice,
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
} 