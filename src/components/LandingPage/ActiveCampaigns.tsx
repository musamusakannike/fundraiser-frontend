"use client";
import React, { useState, useEffect } from 'react';
import { SERVER_URL } from '@/constants';
import { Heart, TrendingUp, Users, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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

const ActiveCampaigns = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSlide, setActiveSlide] = useState<Record<string, number>>({});

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${SERVER_URL}/api/campaigns/active`);
                const data = await response.json();

                if (data.success) {
                    setCampaigns(data.campaigns);

                    // Initialize active slides
                    const initialActiveSlides: Record<string, number> = {};
                    (data.campaigns as Campaign[]).forEach((campaign) => {
                        initialActiveSlides[campaign._id] = 0;
                    });
                    setActiveSlide(initialActiveSlides);
                } else {
                    setError('Failed to fetch campaigns');
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

    const calculateProgress = (amountNeeded: number) => {
        // Simulating random progress between 10-90% for demo purposes
        // In real app, you would calculate this based on amountRaised/amountNeeded
        return Math.floor(Math.random() * 80) + 10;
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
        const campaign = campaigns.find((c) => c._id === campaignId);
        if (campaign && campaign.images) {
            setActiveSlide((prev) => ({
                ...prev,
                [campaignId]: (prev[campaignId] + 1) % campaign.images.length,
            }));
        }
    };

    const prevSlide = (campaignId: string) => {
        const campaign = campaigns.find((c) => c._id === campaignId);
        if (campaign && campaign.images) {
            setActiveSlide((prev) => ({
                ...prev,
                [campaignId]: (prev[campaignId] - 1 + campaign.images.length) % campaign.images.length,
            }));
        }
    };

    if (loading) {
        return (
            <div className="py-24 flex flex-col items-center justify-center text-emerald-700">
                <Loader2 className="h-12 w-12 animate-spin mb-4" />
                <p className="text-lg font-medium">Loading active campaigns...</p>
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
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-4">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Active Campaigns
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-emerald-900 mb-4">Support Our Current Initiatives</h2>
                    <div className="max-w-3xl mx-auto">
                        <p className="text-gray-600 text-lg">
                            Join hands with us to make a meaningful difference. Your support can transform lives and communities in need.
                        </p>
                    </div>
                </div>

                {/* Campaigns List */}
                {campaigns.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-emerald-100">
                        <div className="inline-block p-4 bg-emerald-50 rounded-full mb-4">
                            <Heart className="h-8 w-8 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-800 mb-2">No Active Campaigns</h3>
                        <p className="text-gray-600">
                            There are currently no active campaigns. Please check back later.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {campaigns.map((campaign) => {
                            const progress = calculateProgress(campaign.amountNeeded);

                            return (
                                <div
                                    key={campaign._id}
                                    className="bg-white rounded-2xl overflow-hidden shadow-lg border border-emerald-50 hover:shadow-xl transition-shadow duration-300"
                                >
                                    {/* Image Carousel */}
                                    <div className="relative h-64 overflow-hidden bg-emerald-100">
                                        {campaign.images && campaign.images.length > 0 ? (
                                            <>
                                                <div className="relative h-full">
                                                    {campaign.images.map((image, index) => (
                                                        <div
                                                            key={index}
                                                            className={`absolute inset-0 transition-opacity duration-500 ${index === activeSlide[campaign._id] ? 'opacity-100' : 'opacity-0'
                                                                }`}
                                                        >
                                                            <img
                                                                src={image}
                                                                alt={`${campaign.title} - image ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
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
                                                            <ChevronRight className="w-5 h-5 transform rotate-180 text-emerald-800" />
                                                        </button>
                                                        <button
                                                            onClick={() => nextSlide(campaign._id)}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow-md hover:bg-opacity-100 transition-all duration-200"
                                                        >
                                                            <ChevronRight className="w-5 h-5 text-emerald-800" />
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
                                                <div className="text-emerald-300">
                                                    <div className="flex justify-center">
                                                        <Heart className="h-16 w-16" />
                                                    </div>
                                                    <p className="text-center mt-2 text-emerald-500 font-medium">No image available</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Campaign Status Badge */}
                                        <div className="absolute top-4 left-4 px-3 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-md">
                                            Active Campaign
                                        </div>
                                    </div>

                                    {/* Campaign Details */}
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-bold text-gray-900 leading-tight">{campaign.title}</h3>
                                            <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {formatDate(campaign.createdAt)}
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mb-4 line-clamp-2">
                                            {campaign.description}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mt-6 mb-6">
                                            <div className="flex justify-between text-sm font-medium mb-1">
                                                <span className="text-emerald-700">{progress}% Funded</span>
                                                <span className="text-gray-500">{formatCurrency(campaign.amountNeeded)}</span>
                                            </div>
                                            <Progress value={progress} className="h-2 bg-emerald-100" />
                                        </div>

                                        {/* Campaign Creator */}
                                        <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                                            <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                                                <Users className="h-5 w-5" />
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-xs text-gray-500">Campaign by</p>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {campaign.createdBy?.fullName || "Anonymous"}
                                                </p>
                                            </div>

                                            <div className="ml-auto">
                                                <Button
                                                    className="bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl"
                                                >
                                                    Donate Now
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* View More Button (only show if there are campaigns) */}
                {campaigns.length > 0 && (
                    <div className="text-center mt-12">
                        <Button
                            variant="outline"
                            className="border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 px-6 py-2 rounded-full font-medium transition-all duration-300"
                        >
                            View All Campaigns
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActiveCampaigns;
