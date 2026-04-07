"use client";

export default function CTA() {
  return (
    <section className="py-24 px-8 max-w-7xl mx-auto">
      <div className="bg-brand-primary rounded-[50px] p-24 text-center flex flex-col items-center gap-10 relative overflow-hidden group">
        {/* Animated Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/10 via-transparent to-brand-accent/5 opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-secondary/10 rounded-full blur-[120px] animate-pulse" />

        <h2 className="relative z-10 text-5xl md:text-6xl font-bold text-white max-w-3xl leading-[1.2]">
          Ready for your next <br />
          <span className="text-brand-secondary">Masterpiece Travel?</span>
        </h2>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <button className="px-12 py-5 bg-brand-secondary text-brand-primary rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl">
            Become a Member
          </button>
          <button className="px-12 py-5 border-2 border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/5 transition-all">
            View Fleet Gallery
          </button>
        </div>
      </div>
    </section>
  );
}
