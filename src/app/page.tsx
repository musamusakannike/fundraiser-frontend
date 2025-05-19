import AboutUs from '@/components/LandingPage/AboutUs';
import ActiveCampaigns from '@/components/LandingPage/ActiveCampaigns';
import Hero from '@/components/LandingPage/Hero';
import React from 'react'

const Home = () => {
  return (
    <div>
      <Hero />
      <AboutUs />
      <ActiveCampaigns />
    </div>
  )
}

export default Home;