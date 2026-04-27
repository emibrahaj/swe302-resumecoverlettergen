"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 flex h-[88px] items-center justify-between bg-white px-8 shadow-[0_4px_10px_rgba(146,76,202,0.45)] md:px-[103px]">
      <button
        onClick={() => router.push("/")}
        className="relative h-[54px] w-[120px]"
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

      <div className="hidden items-center gap-12 text-[20px] font-normal md:flex">
        <button
          onClick={() => router.push("/templates")}
          className="hover:text-[#924CCA]"
        >
          CV Templates
        </button>

        <button
          onClick={() => router.push("/strengthen")}
          className="hover:text-[#924CCA]"
        >
          Improve CV
        </button>

        <button
          onClick={() => router.push("/jobs")}
          className="hover:text-[#924CCA]"
        >
          Job Suggestions
        </button>
      </div>

      <div className="flex items-center gap-3 text-[18px] font-bold md:text-[20px]">
        <button
          onClick={() => router.push("/login")}
          className="text-[#924CCA]"
        >
          LogIn
        </button>

        <div className="h-8 w-px bg-[#924CCA]" />

        <button
          onClick={() => router.push("/register")}
          className="border border-[#A86CD7] bg-[#A86CD7]/20 px-3 py-1 text-[#924CCA] shadow"
        >
          Register
        </button>
      </div>
    </nav>
  );
}