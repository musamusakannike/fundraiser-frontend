"use client";
import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '@/constants';
import { CheckCircle, Award, Loader2, ChevronRight, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

// Define types for campaign and state
interface Campaign {
    _id: string;
    title: string;
    description: string;
    images: string[];
    amountNeeded: number;
    createdAt: string;
    createdBy?: {
        fullName?: string;
    };
}

const CompletedCampaigns = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSlide, setActiveSlide] = useState<Record<string, number>>({});
    const [expandedDescription, setExpandedDescription] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${SERVER_URL}/api/campaigns/completed`);
                const data = await response.json();

                if (data.success) {
                    setCampaigns(data.campaigns);

                    // Initialize active slides and description states
                    const initialActiveSlides: Record<string, number> = {};
                    const initialExpandedState: Record<string, boolean> = {};
                    (data.campaigns as Campaign[]).forEach(campaign => {
                        initialActiveSlides[campaign._id] = 0;
                        initialExpandedState[campaign._id] = false;
                    });
                    setActiveSlide(initialActiveSlides);
                    setExpandedDescription(initialExpandedState);
                } else {
                    setError('Failed to fetch completed campaigns');
                }
            } catch (err) {
                setError('An error occurred while fetching campaigns');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-NG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }).format(date);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const nextSlide = (campaignId: string) => {
        const campaign = campaigns.find(c => c._id === campaignId);
        if (campaign && campaign.images) {
            setActiveSlide(prev => ({
                ...prev,
                [campaignId]: (prev[campaignId] + 1) % campaign.images.length
            }));
        }
    };

    const prevSlide = (campaignId: string) => {
        const campaign = campaigns.find(c => c._id === campaignId);
        if (campaign && campaign.images) {
            setActiveSlide(prev => ({
                ...prev,
                [campaignId]: (prev[campaignId] - 1 + campaign.images.length) % campaign.images.length
            }));
        }
    };

    const toggleDescription = (campaignId: string) => {
        setExpandedDescription(prev => ({
            ...prev,
            [campaignId]: !prev[campaignId]
        }));
    };

    // Calculate time since completion (mock data - would come from backend in real app)
    const getTimeAgo = (dateString: string) => {
        const completedDate = new Date(dateString);
        // For demo purposes, we'll assume campaigns were completed a few days after creation
        completedDate.setDate(completedDate.getDate() + 30); // Mock: completed 30 days after creation

        const now = new Date();
        const diffTime = Math.abs(now.getTime() - completedDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) return `${diffDays} days ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    };

    if (loading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center text-teal-700">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <p className="text-lg font-medium">Loading completed campaigns...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-24 text-center">
                <div className="bg-red-50 text-red-700 rounded-xl p-6 inline-block shadow-sm">
                    <p className="text-lg font-medium">{error}</p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-red-100 hover:bg-red-200 text-red-700"
                    >
                        Try Again
                    </Button>
                </div>
            </div >
        )
    }

    return (
        <div className="bg-gradient-to-br from-teal-50 to-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 bg-teal-100 rounded-full text-teal-700 text-sm font-medium mb-4">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed Campaigns
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-teal-900 mb-4">Our Success Stories</h2>
                    <div className="max-w-3xl mx-auto">
                        <p className="text-gray-600 text-lg">
                            See the impact we&apos;ve made together. These campaigns have successfully reached their goals and made a lasting difference.
                        </p>
                    </div>
                </div>

                {/* Campaigns List */}
                {campaigns.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-teal-100">
                        <div className="inline-block p-4 bg-teal-50 rounded-full mb-4">
                            <Award className="h-8 w-8 text-teal-500" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-800 mb-2">No Completed Campaigns Yet</h3>
                        <p className="text-gray-600">
                            We&apos;re still working on our active campaigns. Check back later to see our success stories.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {campaigns.map((campaign) => (
                            <div
                                key={campaign._id}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg border border-teal-50 hover:shadow-xl transition-shadow duration-300 flex flex-col lg:flex-row"
                            >
                                {/* Image Carousel - Left Side for larger screens */}
                                <div className="relative lg:w-2/5 h-64 lg:h-auto overflow-hidden bg-teal-100">
                                    {campaign.images && campaign.images.length > 0 ? (
                                        <>
                                            <div className="relative h-full">
                                                {campaign.images.map((image, index) => (
                                                    <div
                                                        key={index}
                                                        className={`absolute inset-0 transition-opacity duration-500 ${index === activeSlide[campaign._id] ? 'opacity-100' : 'opacity-0'
                                                            }`}
                                                    >
                                                        <Image
                                                            src={image}
                                                            alt={`${campaign.title} - image ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                            width={500}
                                                            height={300}
                                                        />

                                                        {/* Success overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/70 to-transparent flex items-end">
                                                            <div className="p-6 text-white">
                                                                <div className="flex items-center mb-2">
                                                                    <CheckCircle className="w-5 h-5 mr-2 text-teal-300" />
                                                                    <span className="font-medium">Goal Reached</span>
                                                                </div>
                                                                <p className="text-sm text-teal-100">Completed {getTimeAgo(campaign.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Navigation Controls */}
                                            {campaign.images.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={() => prevSlide(campaign._id)}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all duration-200"
                                                    >
                                                        <ChevronRight className="w-5 h-5 transform rotate-180 text-teal-800" />
                                                    </button>
                                                    <button
                                                        onClick={() => nextSlide(campaign._id)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all duration-200"
                                                    >
                                                        <ChevronRight className="w-5 h-5 text-teal-800" />
                                                    </button>

                                                    {/* Dots */}
                                                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                                                        {campaign.images.map((_, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => setActiveSlide(prev => ({
                                                                    ...prev,
                                                                    [campaign._id]: index
                                                                }))}
                                                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === activeSlide[campaign._id]
                                                                    ? 'bg-white w-4'
                                                                    : 'bg-white bg-opacity-50'
                                                                    }`}
                                                                aria-label={`Go to slide ${index + 1}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-teal-300">
                                                <div className="flex justify-center">
                                                    <Award className="h-16 w-16" />
                                                </div>
                                                <p className="text-center mt-2 text-teal-500 font-medium">No image available</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Campaign Status Badge */}
                                    <div className="absolute top-4 left-4 px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full shadow-md">
                                        Completed
                                    </div>
                                </div>

                                {/* Campaign Details - Right Side for larger screens */}
                                <div className="p-6 lg:p-8 lg:w-3/5 flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-2xl font-bold text-gray-900 leading-tight">{campaign.title}</h3>
                                        <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {formatDate(campaign.createdAt)}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <p className={`text-gray-600 ${expandedDescription[campaign._id] ? '' : 'line-clamp-3'}`}>
                                            {campaign.description}
                                        </p>
                                        {campaign.description.length > 180 && (
                                            <button
                                                onClick={() => toggleDescription(campaign._id)}
                                                className="text-teal-600 hover:text-teal-700 text-sm font-medium mt-2 flex items-center"
                                            >
                                                {expandedDescription[campaign._id] ? 'Show less' : 'Read more'}
                                                <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${expandedDescription[campaign._id] ? 'rotate-90' : ''}`} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Achievement Highlights */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-teal-50 p-4 rounded-lg flex items-start">
                                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                                <Award className="h-5 w-5 text-teal-600" />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">Total Raised</p>
                                                <p className="text-lg font-bold text-teal-700">{formatCurrency(campaign.amountNeeded)}</p>
                                            </div>
                                        </div>

                                        <div className="bg-teal-50 p-4 rounded-lg flex items-start">
                                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                                <Users className="h-5 w-5 text-teal-600" />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm font-medium text-gray-900">Contributors</p>
                                                <p className="text-lg font-bold text-teal-700">
                                                    {/* Mock data - would come from backend in real app */}
                                                    {Math.floor(Math.random() * 200) + 50}+ donors
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Success Story and Creator */}
                                    <div className="flex-grow flex flex-col justify-between">
                                        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 rounded-lg mb-4">
                                            <div className="flex items-start">
                                                <div className="mt-1">
                                                    <CheckCircle className="h-5 w-5 text-teal-300" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="font-medium">Success Story</p>
                                                    <p className="text-sm text-teal-100 mt-1">
                                                        This campaign successfully reached its goal and made a positive impact. We thank all contributors for their generous support!
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center">
                                                <div className="bg-teal-100 p-2 rounded-full text-teal-600">
                                                    <Users className="h-5 w-5" />
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-xs text-gray-500">Campaign by</p>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {campaign.createdBy?.fullName || "Anonymous"}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                variant="outline"
                                                className="border-2 border-teal-500 text-teal-700 hover:bg-teal-50 transition-all duration-300 rounded-lg"
                                            >
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* View All Success Stories Button (only show if there are campaigns) */}
                {campaigns.length > 0 && (
                    <div className="text-center mt-12">
                        <Link href="/dashboard/campaigns">
                        <Button
                            className="bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                            View All Success Stories
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompletedCampaigns;