"use client";
import {TrendingUp, Sparkles, Briefcase, Target} from 'lucide-react';
import {useLanguage} from "@/src/context/LanguageContext";

const featureIcons = [TrendingUp, Sparkles, Briefcase, Target];

interface FeaturesProps {
    id?: string
}

export function Features({id}: FeaturesProps) {
    const {t} = useLanguage();

    return (
        <section
            id={id}
            className="py-24 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-16 overflow-hidden"

        >
            <div className="max-w-7xl mx-auto">

                {/* Heading */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-black">
                        {t.features.heading}
                    </h2>

                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                        {t.features.subheading}
                    </p>
                </div>

                {/* Ladder Layout */}
                <div
                    className="relative flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16 lg:gap-6">

                    {t.features.items.map((feature, index) => {
                        const FeatureIcon = featureIcons[index];
                        const offsets = [
                            "lg:mt-24",
                            "lg:mt-16",
                            "lg:mt-8",
                            "lg:mt-0"
                        ];

                        const offset = offsets[index];

                        return (
                            <div
                                key={index}
                                className={`relative flex-1 max-w-[260px] ${offset}`}
                            >

                                {/* Description + line */}
                                <div
                                    className="relative pl-6 mb-8 min-h-[70px]">

                                    {/* Bullet */}
                                    <div
                                        className="absolute left-0 top-1 w-3 h-3 bg-black rounded-full"/>

                                    {/* Vertical line */}
                                    <div
                                        className="absolute left-[5px] top-4 w-[2px] h-20 bg-[#088395]/40"/>

                                    {/* Description */}
                                    <p className="text-sm text-gray-700 leading-snug">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Box */}
                                <div
                                    className="relative rounded-2xl bg-[#088395]/5 border-2 border-[#088395]/20 hover:shadow-xl hover:border-[#088395]/40 px-6 py-8 hover:shadow-xl transition-all">

                                    {/* Floating Icon */}
                                    <div
                                        className="absolute -top-5 left-1/2 -translate-x-1/2 w-14 h-14 rounded-2xl bg-[#088395] flex items-center justify-center shadow-lg">
                                        <FeatureIcon size={26}
                                                      className="text-white"/>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-xl font-semibold text-center text-[#088395] mt-6">
                                        {feature.title}
                                    </h3>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
