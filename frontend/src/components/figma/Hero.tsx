"use client";
import { Sparkles, ArrowRight } from 'lucide-react';
import { AnimatedTemplateBackground } from './AnimatedTemplateBackground';

interface HeroProps {
  onGetStarted: () => void;
}

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="pt-24 sm:pt-28 pb-96 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      <AnimatedTemplateBackground />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-white z-10 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto relative z-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#088395]/10 rounded-full mb-6">
            <Sparkles size={16} className="text-[#088395]" />
            <span className="text-sm text-[#088395]">AI-Powered Resume Builder</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="text-black">Your career starts with the </span>
            <span className="text-[#088395]">right first impression</span>
          </h1>

          <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
            Create professional resumes for free in minutes with our AI-powered tools. Stand out from the crowd and land your dream job.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="group px-8 py-4 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Create CV For Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-foreground/50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">900+</span>
              <span>Templates</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">95%</span>
              <span>Success Rate</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">80+</span>
              <span>Countries</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
