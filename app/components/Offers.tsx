"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

const offers = [
  {
    title: "Amalfi Coast Retreat",
    subtitle: "Stay 3, Pay 2",
    price: "$1,499",
    starting: "STARTING",
    image: "/images/amalfi.png",
    badge: "LIMITED OFFER",
    description: "Experience the ultimate Italian summer with private boat transfers and Michelin-starred dining.",
  },
  {
    title: "Global Chauffeur Credit",
    subtitle: "Voyager Fleet",
    price: "$250",
    starting: "MEMBER GET",
    image: "/images/car.png",
    badge: "VOYAGER FLEET",
    description: "Book 10 inter-city transfers and receive $250 credit toward your next flight booking.",
  },
  {
    title: "First Class Upgrades",
    subtitle: "Sky Priority",
    price: "Free",
    starting: "UPGRADE",
    image: "/images/jet.png",
    description: "Complimentary upgrades to First Class for all trans-Atlantic bookings this quarter.",
  },
];

export default function Offers() {
  return (
    <section className="py-24 px-8 max-w-7xl mx-auto bg-white">
      <div className="flex items-end justify-between mb-12">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-[0.2em] mb-1">Curated Collections</span>
          <h2 className="text-4xl font-bold text-brand-primary">Top Exclusive Offers</h2>
        </div>
        <button className="flex items-center gap-2 group text-brand-primary font-semibold hover:text-brand-secondary transition-colors">
          View All Experiences
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {offers.map((offer, idx) => (
          <div key={idx} className="group relative bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-black/5">
            <div className="relative h-[480px] w-full overflow-hidden">
              <Image
                src={offer.image}
                alt={offer.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
              
              {offer.badge && (
                <div className="absolute top-6 left-6 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                  {offer.badge}
                </div>
              )}

              <div className="absolute bottom-10 left-10 right-10 flex flex-col justify-end text-white">
                <span className="text-sm font-medium opacity-80 mb-1">{offer.subtitle}</span>
                <h3 className="text-2xl font-bold mb-4">{offer.title}</h3>
                
                <div className="flex items-end justify-between gap-4 pt-4 border-t border-white/20">
                   <p className="text-xs opacity-70 flex-1 leading-relaxed">{offer.description}</p>
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{offer.starting}</span>
                      <span className="text-xl font-bold text-brand-secondary">{offer.price}</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
