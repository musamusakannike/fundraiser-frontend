import React from 'react'
import Link from 'next/link'

const Footer = () => {
    return (
        <footer className="bg-gray-100 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-600 mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} Nigerian Islamic Fundraiser. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/terms" className="text-gray-600 hover:text-emerald-700">
                            Terms of Service
                        </Link>
                        <Link href="/privacy" className="text-gray-600 hover:text-emerald-700">
                            Privacy Policy
                        </Link>
                        <Link href="/contact" className="text-gray-600 hover:text-emerald-700">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer