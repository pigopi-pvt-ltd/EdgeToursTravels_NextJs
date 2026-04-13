import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Offers from '@/components/Offers';
import WhatWeOffer from '@/components/WhatWeOffer';
import TravelGuide from '@/components/TravelGuide';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0A1128] text-[#0A1128] dark:text-white font-sans transition-colors duration-300">
      <Navbar />
      <Hero />
      <Offers />
      <WhatWeOffer />
      <TravelGuide />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}