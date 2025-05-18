import React from 'react';
import { Globe, HandHeart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Islamic pattern overlay - subtle geometric background */}
      <div 
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSIxMDAiPgo8cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjhmOGY4Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0yOCA2NkwwIDUwTDAgMTZMMjggMEw1NiAxNkw1NiA1MEwyOCA2NkwyOCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2VlZWVlZSIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+CjxwYXRoIGQ9Ik0yOCAwTDI4IDM0TDAgNTBMMCA4NEwyOCAxMDBMNTYgODRMNTYgNTBMMjggMzQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y4ZjhmOCIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-10 bg-repeat"
        aria-hidden="true"
      ></div>

      {/* Main hero content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-emerald-900 sm:text-5xl md:text-6xl">
              <span className="block">Your Advocate</span>
              <span className="block mt-3 text-emerald-600 text-3xl sm:text-4xl md:text-5xl">Your voice, Their hope</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-gray-600 sm:text-xl">
              Join our mission to provide essential support and resources to those in need within our community and around the world.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex justify-center gap-4">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-6 text-lg rounded-md shadow-lg transition-all duration-300 flex items-center gap-2">
                <HandHeart className="w-5 h-5" />
                Donate Now
              </Button>
              <Button variant="outline" className="border-emerald-700 text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg rounded-md shadow-sm transition-all duration-300">
                Learn More
              </Button>
            </div>
          </div>

          {/* Impact statistics */}
          <div className="mt-16 border-t border-gray-200 pt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <HandHeart className="h-7 w-7" />
                </div>
                <p className="mt-4 text-3xl font-bold text-emerald-900">$250K+</p>
                <p className="mt-2 text-base text-gray-600">Funds Raised</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Users className="h-7 w-7" />
                </div>
                <p className="mt-4 text-3xl font-bold text-emerald-900">15K+</p>
                <p className="mt-2 text-base text-gray-600">Lives Impacted</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Globe className="h-7 w-7" />
                </div>
                <p className="mt-4 text-3xl font-bold text-emerald-900">12</p>
                <p className="mt-2 text-base text-gray-600">Countries Served</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 140" className="fill-emerald-50">
          <path d="M0,128L80,117.3C160,107,320,85,480,90.7C640,96,800,128,960,122.7C1120,117,1280,75,1360,53.3L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;