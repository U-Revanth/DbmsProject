'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Book Cars', path: '/garages' },
    { name: 'My Bookings', path: '/my-bookings' },
  ];

  const linkStyle = (path) =>
    `hover:text-gray-900 font-medium transition-colors ${
      pathname === path ? 'text-gray-900 font-semibold' : 'text-gray-600'
    }`;

  return (
    <nav className="bg-white shadow-sm w-full sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="font-bold text-gray-900 text-xl">Car Rental</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} className={linkStyle(item.path)}>
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Button */}
          <div className="hidden md:block">
            {status === "unauthenticated" ? (
              <Button asChild variant="outline" className="border-gray-900 text-gray-900 hover:bg-gray-50">
                <Link href="/api/auth/signin">Login</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="border-gray-900 text-gray-900 hover:bg-gray-50">
                <Link href="/api/auth/signout">Sign Out</Link>
              </Button>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button
            className="md:hidden focus:outline-none text-gray-900"
            onClick={toggleMenu}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${linkStyle(item.path)} block`}
                onClick={() => setMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-2">
              {status === "unauthenticated" ? (
                <Button asChild variant="outline" className="w-full border-gray-900 text-gray-900 hover:bg-gray-50">
                  <Link href="/api/auth/signin">Login</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full border-gray-900 text-gray-900 hover:bg-gray-50">
                  <Link href="/api/auth/signout">Sign Out</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
