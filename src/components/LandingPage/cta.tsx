import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button' // Ensure you have this path right based on your project structure

const CTA = () => {
    return (
        <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 py-20 text-white relative overflow-hidden">
            {/* Decorative Islamic pattern overlay */}
            <div className="absolute inset-0 opacity-10 bg-[url('/images/islamic-pattern.svg')] bg-repeat"></div>

            {/* Light beams effect */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-emerald-300 opacity-10 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-6 text-center relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                    Be Part of Something <span className="text-emerald-300">Meaningful</span>
                </h2>

                <p className="text-xl mb-10 max-w-3xl mx-auto font-light leading-relaxed">
                    Join our growing community of compassionate individuals committed to supporting
                    Islamic causes and creating positive change across Nigeria.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link href="/register" passHref>
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-white text-white hover:bg-emerald-600 hover:border-emerald-600 transition-all duration-300 px-8 py-6 text-lg font-medium rounded-full"
                        >
                            Create Account
                        </Button>
                    </Link>
                    <Link href="/campaigns" passHref>
                        <Button
                            size="lg"
                            className="bg-white text-emerald-800 hover:bg-emerald-100 transition-all duration-300 px-10 py-6 text-lg font-bold rounded-full shadow-lg"
                        >
                            Explore Campaigns
                        </Button>
                    </Link>
                </div>

                <p className="mt-10 text-emerald-200 font-light italic">
                    "The believer's shade on the Day of Resurrection will be their charity" — Prophet Muhammad (PBUH)
                </p>
            </div>
        </section>
    );
}

export default CTA;
