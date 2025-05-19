import AboutUs from '@/components/LandingPage/AboutUs';
import ActiveCampaigns from '@/components/LandingPage/ActiveCampaigns';
import CompletedCampaigns from '@/components/LandingPage/CompletedCampaigns';
import CTA from '@/components/LandingPage/cta';
import Footer from '@/components/LandingPage/Footer';
import Hero from '@/components/LandingPage/Hero';
import React from 'react'

const Home = () => {
  return (
    <div>
      <Hero />
      <AboutUs />
      <ActiveCampaigns />
      <CompletedCampaigns />
      <CTA />
      <Footer />
    </div>
  )
}

export default Home;