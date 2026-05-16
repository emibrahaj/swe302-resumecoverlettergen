"use client";

import {useState} from "react";
import {CookiePolicyModal} from "@/src/components/figma/CookiePolicyModal";
import {useLanguage} from "@/src/context/LanguageContext";
import Link from "next/link";

export function Footer() {
    const [showCookiePolicy, setShowCookiePolicy] = useState(false);
    const {t} = useLanguage();

    return (
        <footer
            className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-4">DiversiHire</h3>

                        <p className="text-gray-400 mb-5">
                            {t.footer.description}
                        </p>

                        <div className="flex items-center gap-4">
                            <a
                                href="https://www.instagram.com/diversihire"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Diversihire Instagram"
                                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-[#088395] hover:bg-[#088395] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <InstagramSvg/>
                            </a>

                            <a
                                href="https://www.facebook.com/diversihire"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Diversihire Facebook"
                                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-[#088395] hover:bg-[#088395] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <FacebookSvg/>
                            </a>

                            <a
                                href="https://www.linkedin.com/in/diversi-hire-63619840a/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Diversihire LinkedIn"
                                className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-700 text-gray-400 hover:text-white hover:border-[#088395] hover:bg-[#088395] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                            >
                                <LinkedinSvg/>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4 text-white">{t.footer.product}</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                {/* Points to the Features section ID on the homepage */}
                                <Link href="/#features"
                                   className="hover:text-[#088395] transition-colors">
                                    {t.footer.features}
                                </Link>
                            </li>
                            <li>
                                {/* Points to your Template Showcase section ID */}
                                <Link href="/#templates"
                                   className="hover:text-[#088395] transition-colors">
                                    {t.footer.templates}
                                </Link>
                            </li>
                            <li>
                                {/* Points to the separate Pricing page */}
                                <Link href="/pricing"
                                   className="hover:text-[#088395] transition-colors">
                                    {t.footer.pricing}
                                </Link>
                            </li>
                            <li>
                                {/* Points to the "How it Works" or Reviews section as examples */}
                                <Link href="/#how-it-works"
                                   className="hover:text-[#088395] transition-colors">
                                    {t.footer.howItWorks}
                                </Link>
                            </li>
                            <li>
                                <Link href="/#for-companies"
                                   className="hover:text-[#088395] transition-colors">
                                    {t.footer.forCompanies}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">{t.footer.company}</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <Link href="/about"
                                   className="hover:text-white transition-colors">
                                    {t.footer.about}
                                </Link>
                            </li>
                            <li>
                                <a href="#"
                                   className="hover:text-white transition-colors">
                                    {t.footer.careers}
                                </a>
                            </li>

                            <li>
                                <Link href="/contact"
                                   className="hover:text-white transition-colors">
                                    {t.footer.contact}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li>
                                <Link
                                    href="/privacy-policy"
                                    className="hover:text-white transition-colors"
                                >
                                    {t.footer.privacy}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/terms-of-service"
                                    className="hover:text-white transition-colors"
                                >
                                    {t.footer.terms}
                                </Link>
                            </li>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => setShowCookiePolicy(true)}
                                    className="hover:text-white transition-colors text-left"
                                >
                                    {t.footer.cookies}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div
                    className="border-t border-gray-800 pt-8 text-center text-gray-400">
                    <p>&copy; 2026 DiversiHire. {t.footer.rights}</p>
                </div>
            </div>

            <CookiePolicyModal
                isOpen={showCookiePolicy}
                onClose={() => setShowCookiePolicy(false)}
            />
        </footer>
    );
}

function InstagramSvg() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
    );
}

function FacebookSvg() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path
                d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06z"/>
        </svg>
    );
}

function LinkedinSvg() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path
                d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0z"/>
        </svg>
    );
}
