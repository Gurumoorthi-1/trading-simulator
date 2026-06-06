import React, { useEffect } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import AISection from '../components/landing/AISection';
import PricingSection from '../components/landing/PricingSection';
import TestimonialsFAQ from '../components/landing/TestimonialsFAQ';
import Footer from '../components/landing/Footer';

const Landing = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="bg-dark-bg min-h-screen text-dark-text selection:bg-primary-500 selection:text-white pt-20 md:pt-0">
      <LandingNavbar />
      <div id="home">
        <HeroSection />
      </div>
      <div id="features">
        <FeaturesSection />
      </div>
      <AISection />
      <div id="pricing">
        <PricingSection />
      </div>
      <TestimonialsFAQ />
      <Footer />
    </div>
  );
};

export default Landing;
