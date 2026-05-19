"use client";
import {ArrowRight, BarChart3, Building2, Target, Users} from 'lucide-react';
import {useLanguage} from "@/src/context/LanguageContext";

const companyFeatureIcons = [Building2, Users, Target, BarChart3];

interface ForCompaniesProps {
    onRegisterClick?: () => void;
}

export function ForCompanies({onRegisterClick}: ForCompaniesProps) {
    const {t} = useLanguage();

    return (
        <section id="for-companies" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#088395]/10 rounded-full mb-6">
                            <Building2 size={16} className="text-[#088395]"/>
                            <span className="text-sm text-[#088395]">{t.companies.badge}</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            {t.companies.heading}
                        </h2>
                        <p className="text-xl text-foreground/70 mb-8">
                            {t.companies.subheading}
                        </p>

                        <div className="space-y-6 mb-8">
                            {t.companies.features.map((feature, index) => {
                                const FeatureIcon = companyFeatureIcons[index];
                                return (
                                    <div key={index} className="flex gap-4">
                                        <div
                                            className="w-12 h-12 flex-shrink-0 bg-[#088395] rounded-xl flex items-center justify-center">
                                            <FeatureIcon size={24} className="text-white"/>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">{feature.title}</h3>
                                            <p className="text-foreground/70">{feature.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={onRegisterClick}
                            className="group px-8 py-4 bg-[#088395] text-white rounded-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                        >
                            {t.companies.cta}
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 bg-[#088395]/20 rounded-2xl blur-3xl opacity-20"></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                            <div className="space-y-6">
                                <div className="border-2 border-[#088395]/30 rounded-xl p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-semibold mb-1">{t.companies.jobCards.frontend}</h4>
                                            <p className="text-sm text-foreground/70">{t.companies.jobCards.remoteFullTime}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {t.companies.jobCards.active}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-foreground/70">
                                        <span>{t.companies.jobCards.applicants24}</span>
                                        <span>•</span>
                                        <span>{t.companies.jobCards.matches8}</span>
                                    </div>
                                </div>

                                <div className="border-2 border-[#088395]/20 rounded-xl p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-semibold mb-1">{t.companies.jobCards.product}</h4>
                                            <p className="text-sm text-foreground/70">{t.companies.jobCards.newYorkHybrid}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {t.companies.jobCards.active}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-foreground/70">
                                        <span>{t.companies.jobCards.applicants16}</span>
                                        <span>•</span>
                                        <span>{t.companies.jobCards.matches5}</span>
                                    </div>
                                </div>

                                <div className="border-2 border-gray-200 rounded-xl p-6 opacity-60">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-semibold mb-1">{t.companies.jobCards.designer}</h4>
                                            <p className="text-sm text-foreground/70">{t.companies.jobCards.londonFullTime}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {t.companies.jobCards.closed}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-foreground/70">
                                        <span>{t.companies.jobCards.applicants42}</span>
                                        <span>•</span>
                                        <span>{t.companies.jobCards.hired1}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
