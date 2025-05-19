import React from 'react';
import { Book, Heart, Users, HandHeart, Globe } from 'lucide-react';
import {
    Carousel,
    CarouselContent,
    CarouselItem
} from '@/components/ui/carousel';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

// Fundraising categories array
const categories = [
    { name: 'Education', icon: Book, description: 'Support Islamic education initiatives' },
    { name: 'Health', icon: Heart, description: 'Provide medical aid to those in need' },
    { name: 'Community', icon: Users, description: 'Strengthen Muslim communities' },
    { name: 'Relief', icon: HandHeart, description: 'Emergency humanitarian assistance' },
    { name: 'Global Outreach', icon: Globe, description: 'Supporting Muslims worldwide' },
    { name: 'Education', icon: Book, description: 'Support Islamic education initiatives' },
    { name: 'Health', icon: Heart, description: 'Provide medical aid to those in need' },
    { name: 'Community', icon: Users, description: 'Strengthen Muslim communities' },
];

const AboutUs: React.FC = () => {
    return (
        <div className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
            {/* Islamic pattern overlay - subtle geometric background (same as Hero) */}
            <div
                className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSIxMDAiPgo8cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiBmaWxsPSIjZjhmOGY4Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0yOCA2NkwwIDUwTDAgMTZMMjggMEw1NiAxNkw1NiA1MEwyOCA2NkwyOCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2VlZWVlZSIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+CjxwYXRoIGQ9Ik0yOCAwTDI4IDM0TDAgNTBMMCA4NEwyOCAxMDBMNTYgODRMNTYgNTBMMjggMzQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2Y4ZjhmOCIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+Cjwvc3ZnPg==')] opacity-10 bg-repeat"
                aria-hidden="true"
            ></div>

            <div className="relative max-w-7xl mx-auto">
                <div className="lg:flex lg:items-center lg:gap-16">
                    {/* Image section */}
                    <div className="lg:w-1/2 mb-10 lg:mb-0">
                        <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
                            <Image
                                src="/icon.jpg"
                                alt="Your Advocate's Mission"
                                className="w-full h-full object-cover"
                                width={320}
                                height={320}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/70 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-6">
                                <h3 className="text-white text-2xl font-bold">Our Mission</h3>
                                <p className="text-emerald-50 mt-2">Supporting communities since 2024</p>
                            </div>
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="lg:w-1/2">
                        <h2 className="text-3xl font-bold tracking-tight text-emerald-900 sm:text-4xl">About Your Advocate</h2>
                        <div className="w-20 h-1 bg-emerald-600 mt-4 mb-6"></div>
                        <div className="prose prose-emerald max-w-none">
                            <p className="text-gray-600 mb-4">
                                Founded with a vision to be the voice of those in need, Your Advocate has been at the forefront of Islamic charitable work for over a decade.
                                We believe in transparency, compassion, and sustainable impact in everything we do.
                            </p>
                            <p className="text-gray-600 mb-4">
                                Our team consists of dedicated professionals and volunteers who work tirelessly to ensure that your contributions reach those who need them the most.
                                From emergency relief to long-term development projects, we strive to make a meaningful difference in the lives of communities worldwide.
                            </p>
                            <p className="text-gray-600">
                                With your support, we have been able to implement numerous projects across multiple countries,
                                providing essential resources, education, healthcare, and much more to underserved populations.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Categories section with infinite scroll */}
                <div className="mt-16 pt-10 border-t border-gray-200">
                    <h3 className="text-2xl font-bold text-center text-emerald-900 mb-8">Our Focus Areas</h3>

                    <div className="overflow-hidden -mx-4">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-1">
                                {categories.map((category, index) => (
                                    <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/4">
                                        <Card className="h-48 flex flex-col items-center justify-center p-6 transition-all duration-300 hover:shadow-lg hover:border-emerald-200 bg-white">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-3">
                                                <category.icon className="h-6 w-6" />
                                            </div>
                                            <h4 className="font-bold text-emerald-900 mb-2">{category.name}</h4>
                                            <p className="text-gray-600 text-center text-sm">{category.description}</p>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                    </div>

                    {/* Subtle hint about the carousel */}
                    <p className="text-center text-sm text-gray-500 mt-4 italic">
                        Scroll horizontally to explore more categories
                    </p>
                </div>
            </div>

            {/* Decorative bottom wave - same as Hero */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 140" className="fill-emerald-50">
                    <path d="M0,128L80,117.3C160,107,320,85,480,90.7C640,96,800,128,960,122.7C1120,117,1280,75,1360,53.3L1440,32L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                </svg>
            </div>
        </div>
    );
};

export default AboutUs;