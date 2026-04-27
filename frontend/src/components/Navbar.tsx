"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const navItems = [
    { label: "CV Templates", path: "/templates" },
    { label: "Improve CV", path: "/strengthen" },
    { label: "Job Suggestions", path: "/jobs" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-[#E7D3F7] bg-white/85 px-8 shadow-[0_4px_18px_rgba(146,76,202,0.20)] backdrop-blur-md md:px-[103px]">
      <div className="mx-auto flex h-[88px] max-w-[1440px] items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="relative h-[62px] w-[135px] transition duration-300 hover:scale-105"
          aria-label="Go to homepage"
        >
          <Image
            src="/assets/logo.png"
            alt="CVify logo"
            fill
            priority
            className="object-contain"
          />
        </button>

        {/* Center Links */}
        <div className="hidden items-center gap-3 rounded-full bg-[#F7EEFF] p-2 text-[18px] font-medium md:flex">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className="rounded-full px-6 py-3 text-[#1f1f1f] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#924CCA] hover:shadow-[0_4px_12px_rgba(146,76,202,0.20)]"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3 text-[18px] font-bold">
          <button
            onClick={() => router.push("/login")}
            className="rounded-full px-5 py-2 text-[#924CCA] transition duration-300 hover:bg-[#F7EEFF] hover:shadow-sm"
          >
            Login
          </button>

          <button
            onClick={() => router.push("/register")}
            className="rounded-full bg-gradient-to-r from-[#924CCA] to-[#B77BE8] px-6 py-3 text-white shadow-[0_5px_15px_rgba(146,76,202,0.35)] transition duration-300 hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_8px_20px_rgba(146,76,202,0.45)]"
          >
            Register
          </button>
        </div>
      </div>
    </nav>
  );
}