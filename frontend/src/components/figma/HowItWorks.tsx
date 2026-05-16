"use client";
import {Download, LayoutTemplate, Sparkles, UserPlus} from 'lucide-react';
import {useLanguage} from "@/src/context/LanguageContext";

const stepMeta = [{
    number: '01',
    icon: UserPlus,
    color: 'bg-[#0aa3b5]'
}, {
    number: '02',
    icon: LayoutTemplate,
    color: 'bg-[#0997a8]'
}, {
    number: '03',
    icon: Sparkles,
    color: 'bg-[#088395]'
}, {
    number: '04',
    icon: Download,
    color: 'bg-[#067182]'
}];

interface HowItWorksProps {
    id?: string
}

export function HowItWorks({id}: HowItWorksProps) {
    const {t} = useLanguage();

    return (<section
            id={id}
            className="py-20 px-4 sm:px-6 lg:px-8 relative">
            <div
                className="absolute inset-0 bg-gradient-to-b from-white via-cyan-50 to-white pointer-events-none"></div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        {t.howItWorks.heading}
                    </h2>
                    <p className="text-xl text-foreground/70">
                        {t.howItWorks.subheading}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {t.howItWorks.steps.map((step, index) => {
                        const meta = stepMeta[index];
                        const StepIcon = meta.icon;
                        return (
                        <div key={index} className="relative">
                            <div
                                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow h-full">
                                <div
                                    className={`text-6xl font-bold ${meta.color} bg-clip-text text-transparent mb-4`}>
                                    {meta.number}
                                </div>
                                <div
                                    className={`w-12 h-12 ${meta.color} rounded-xl flex items-center justify-center mb-4`}>
                                    <StepIcon size={24}
                                               className="text-white"/>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                <p className="text-foreground/70">{step.description}</p>
                            </div>
                            {index < t.howItWorks.steps.length - 1 && (<div
                                    className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-cyan-300 to-teal-300"></div>)}
                        </div>
                    )})}
                </div>
            </div>
        </section>);
}
