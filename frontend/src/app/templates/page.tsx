"use client";

import Image from "next/image";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";

const templates = [
  { id: 1, name: "CV 1", image: "/assets/cv1.png" },
  { id: 2, name: "CV 2", image: "/assets/cv2.png" },
  { id: 3, name: "CV 3", image: "/assets/cv3.png" },
  { id: 4, name: "CV 4", image: "/assets/cv4.png" },
  { id: 5, name: "CV 5", image: "/assets/cv5.png" },
];

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(3);
  const [templateType, setTemplateType] = useState<"simple" | "advanced">(
    "simple"
  );

  return (
    <PageTransition>
      <main className="min-h-screen bg-white text-[#121212]">
        <Navbar />

        <section className="min-h-[calc(100vh-88px)] bg-[rgba(226,190,255,0.11)] shadow-[inset_0_0_15px_4px_#924CCA]">
          <div className="mx-auto max-w-[1440px] px-8 py-16">
            <div className="text-center">
              <h1 className="text-[42px] font-bold">Choose your template</h1>

              <p className="mt-3 text-[28px]">
                Ready to use templates that will help your CV stand out
              </p>

              <div className="mt-14 flex justify-center gap-6">
                <button
                  onClick={() => setTemplateType("simple")}
                  className={`rounded-[10px] px-8 py-2 text-[24px] transition duration-300 hover:scale-105 ${
                    templateType === "simple"
                      ? "bg-[#924CCA] text-white"
                      : "bg-[#D9B9F0]"
                  }`}
                >
                  Simple
                </button>

                <button
                  onClick={() => setTemplateType("advanced")}
                  className={`rounded-[10px] px-8 py-2 text-[24px] transition duration-300 hover:scale-105 ${
                    templateType === "advanced"
                      ? "bg-[#924CCA] text-white"
                      : "bg-[#D9B9F0]"
                  }`}
                >
                  Advanced
                </button>
              </div>
            </div>

            <div className="relative mt-20 bg-[#d8d0dc] px-8 py-16">
              <button className="absolute left-10 top-1/2 z-20 flex h-[76px] w-[140px] -translate-y-1/2 items-center justify-center rounded-[15px] bg-[#924CCA]/50 text-6xl text-[#2b153d] transition duration-300 hover:scale-105 hover:bg-[#924CCA]/70">
                ‹
              </button>

              <button className="absolute right-10 top-1/2 z-20 flex h-[76px] w-[140px] -translate-y-1/2 items-center justify-center rounded-[15px] bg-[#924CCA]/50 text-6xl text-[#2b153d] transition duration-300 hover:scale-105 hover:bg-[#924CCA]/70">
                ›
              </button>

              <div className="flex items-center justify-center gap-10 overflow-hidden">
                {templates.map((template) => {
                  const isSelected = selectedTemplate === template.id;

                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`relative shrink-0 transition duration-300 ${
                        isSelected ? "scale-110" : "scale-95 opacity-80"
                      }`}
                    >
                      <div
                        className={`relative bg-white shadow-lg ${
                          isSelected
                            ? "h-[455px] w-[340px]"
                            : "h-[390px] w-[250px]"
                        }`}
                      >
                        <Image
                          src={template.image}
                          alt={template.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {isSelected && (
                        <div className="absolute left-1/2 top-1/2 flex h-[70px] w-[250px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[12px] bg-[#924CCA] text-[28px] font-bold text-white shadow-lg transition duration-300 hover:scale-105">
                          Choose
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
    </PageTransition>
  );
}