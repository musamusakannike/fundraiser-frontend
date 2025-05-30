"use client";
import React, { useState, useEffect } from 'react';
import { Globe, HandHeart, Users, ChevronRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/authContext';
import Link from 'next/link';

const Hero = () => {
  const { token } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white min-h-screen flex flex-col justify-center">
      {/* Enhanced Islamic pattern overlay with parallax effect */}
      <div
        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+CiAgPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSJub25lIj48L3JlY3Q+CiAgPHBhdGggZD0iTTAgMGg4MHY4MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDk5MDZkIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+CiAgPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMzgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzA5OTA2ZCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMC41Ij48L2NpcmNsZT4KICA8Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIzMiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDk5MDZkIiBzdHJva2Utb3BhY2l0eT0iMC4wOCIgc3Ryb2tlLXdpZHRoPSIwLjUiPjwvY2lyY2xlPgogIDxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjI2IiBmaWxsPSJub25lIiBzdHJva2U9IiMwOTkwNmQiIHN0cm9rZS1vcGFjaXR5PSIwLjA4IiBzdHJva2Utd2lkdGg9IjAuNSI+PC9jaXJjbGU+CiAgPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzA5OTA2ZCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiIHN0cm9rZS13aWR0aD0iMC41Ij48L2NpcmNsZT4KICA8Y2lyY2xlIGN4PSI0MCIgY3k9IjQwIiByPSIxNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDk5MDZkIiBzdHJva2Utb3BhY2l0eT0iMC4wOCIgc3Ryb2tlLXdpZHRoPSIwLjUiPjwvY2lyY2xlPgogIDxjaXJjbGUgY3g9IjQwIiBjeT0iNDAiIHI9IjgiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzA5OTA2ZCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDgiIHN0cm9rZS13aWR0aD0iMC41Ij48L2NpcmNsZT4KPC9zdmc+Cg==')] opacity-30 bg-repeat"
        style={{ transform: scrolled ? 'translateY(10px)' : 'translateY(0)', transition: 'transform 0.5s ease-out' }}
        aria-hidden="true"
      ></div>

      {/* Subtle animated gradient circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDuration: '7s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-emerald-300 to-teal-200 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>

      {/* Main hero content */}
      <div className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32 z-10">
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="mx-auto mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-100 rounded-full blur-md transform scale-110"></div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg">
                <Heart className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>

          {/* Heading with enhanced typography */}
          <h1 className="text-4xl font-extrabold tracking-tighter text-emerald-950 sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">Your Advocate</span>
            <span className="block mt-3 text-emerald-500 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light">Your voice, Their hope</span>
          </h1>

          {/* Separator design element */}
          <div className="relative flex justify-center my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-64 border-t border-emerald-200"></div>
            </div>
            <div className="relative bg-emerald-100 px-4 py-1 rounded-full">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                <span className="text-xs font-bold">✦</span>
              </div>
            </div>
          </div>

          {/* Enhanced description */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl leading-relaxed">
            Join our mission to provide essential support and resources to those in need within our community and around the world. Together, we can create lasting change.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-5">
            <Link href={`${token ? "/dashboard" : "/login"}`}>
              <Button className="bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white px-8 py-6 text-lg rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3">
                <HandHeart className="w-5 h-5" />
                <span>Donate Now</span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </Button>
            </Link>
            <Link href={"#about"}>
              <Button variant="outline" className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg rounded-xl shadow-md transition-all duration-300 transform hover:scale-105">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Enhanced impact statistics */}
        {/* Impact overview with generalized metrics */}
        <div className="mt-20 relative">
          {/* Decorative top border */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent rounded-full"></div>
          </div>

          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
              <div className="flex flex-col items-center transition-transform duration-300 hover:transform hover:scale-105">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-200 rounded-full blur-sm transform scale-110"></div>
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md">
                    <HandHeart className="h-8 w-8" />
                  </div>
                </div>
                <p className="mt-6 text-xl font-semibold text-emerald-900">Significant Support</p>
                <p className="mt-2 text-base text-gray-600 font-medium text-center">Ongoing contributions are driving real impact</p>
              </div>

              <div className="flex flex-col items-center transition-transform duration-300 hover:transform hover:scale-105">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-200 rounded-full blur-sm transform scale-110"></div>
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md">
                    <Users className="h-8 w-8" />
                  </div>
                </div>
                <p className="mt-6 text-xl font-semibold text-emerald-900 text-center">Growing Community</p>
                <p className="mt-2 text-base text-gray-600 font-medium text-center">Many lives have been positively influenced</p>
              </div>

              <div className="flex flex-col items-center transition-transform duration-300 hover:transform hover:scale-105">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-200 rounded-full blur-sm transform scale-110"></div>
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-md">
                    <Globe className="h-8 w-8" />
                  </div>
                </div>
                <p className="mt-6 text-xl font-semibold text-emerald-900">Focused in Nigeria</p>
                <p className="mt-2 text-base text-gray-600 font-medium text-center">Our impact is currently centered within Nigeria</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Enhanced decorative bottom wave with multi-layer effect */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="fill-emerald-50" preserveAspectRatio="none">
          <path d="M0,224L40,229.3C80,235,160,245,240,240C320,235,400,213,480,197.3C560,181,640,171,720,181.3C800,192,880,224,960,224C1040,224,1120,192,1200,176C1280,160,1360,160,1400,160L1440,160L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"></path>
        </svg>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="fill-emerald-100 opacity-80" preserveAspectRatio="none">
            <path d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="fill-emerald-200 opacity-50" preserveAspectRatio="none">
            <path d="M0,160L48,165.3C96,171,192,181,288,186.7C384,192,480,192,576,176C672,160,768,128,864,122.7C960,117,1056,139,1152,160C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Hero;