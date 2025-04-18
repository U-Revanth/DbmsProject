'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Car, Calendar, MapPin, Shield } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Premium Car Rental
              <span className="block text-4xl md:text-5xl font-normal mt-2">Experience the Freedom</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Discover our fleet of premium vehicles and enjoy a seamless rental experience with flexible booking options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gray-900 text-white hover:bg-gray-800">
                <Link href="/garages">Book Now</Link>
              </Button>
              {!session && (
                <Button asChild variant="outline" size="lg" className="border-gray-900 text-gray-900 hover:bg-gray-50">
                  <Link href="/api/auth/signin">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
                <Car className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Wide Selection</h3>
              <p className="text-gray-600">Choose from our diverse fleet of premium vehicles to suit your needs.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Flexible Booking</h3>
              <p className="text-gray-600">Book your car for any duration with our easy-to-use reservation system.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-gray-900" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Reliable</h3>
              <p className="text-gray-600">Enjoy peace of mind with our secure payment system and reliable service.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Hit the Road?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Start your journey with us today. Browse our available cars and find the perfect match for your needs.
            </p>
            <Button asChild size="lg" className="bg-gray-900 text-white hover:bg-gray-800">
              <Link href="/garages">Explore Our Fleet</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
