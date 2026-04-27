"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

export default function HomePage() {
  const router = useRouter();

  function handleCreateCVClick() {
    router.push("/resume/create");
  }

  function handleSeePlansClick() {
    router.push("/pricing");
  }

  const featuresList = [
    {
      title: "Online CV Builder",
      text: "Create a professionally written, visually polished, and job-optimised CV in minutes.",
      icon: "/assets/light.png",
    },
    {
      title: "Designed Templates",
      text: "Access to a range of professional CV templates with real-time customisation options.",
      icon: "/assets/sparkle.png",
    },
    {
      title: "AI writing",
      text: "Write a short info about your experience. Our AI rewrites it with impact-driven language that stands out to hiring managers.",
      icon: "/assets/brain.png",
    },
    {
      title: "Save Time",
      text: "Focus on job search, let us do the writing.",
      icon: "/assets/clock.png",
    },
  ];

  const steps = [
    "Choose a template",
    "Enter your details",
    "Let AI improve it",
    "Download your CV",
  ];

  const tools = [
    {
      title: "Strengthen your CV",
      text: "Boost your chances of getting hired with a CV tailored to the job or company you’re applying for.",
    },
    {
      title: "Course Recommendation",
      text: "Get introduced to online courses you can take based on your degree in order to improve your skills further.",
    },
    {
      title: "Job Suggestions",
      text: "Get job recommendations based on your role and location. Discover opportunities that match your skills and experience.",
    },
  ];

  return (
    <PageTransition>
      <main className="min-h-screen bg-white text-[#121212]">
        <Navbar />

        <div className="bg-[rgba(226,190,255,0.11)] shadow-[inset_0_0_15px_4px_#924CCA]">
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="relative h-[1120px] w-full overflow-hidden">
              <div className="absolute left-[103px] top-[270px] z-20 w-[710px]">
                <h1 className="text-[60px] font-bold leading-[76px] text-[#121212]">
                  Your career starts with the right{" "}
                  <span className="text-[#924CCA]">first impression.</span>
                </h1>

                <p className="mt-[11px] w-[579px] text-[24px] leading-[30px] text-black">
                  Paste your experience and let our AI craft a polished,
                  job-ready CV in minutes.
                </p>

                <button
                  onClick={handleCreateCVClick}
                  className="mt-[32px] h-[79px] w-[260px] rounded-[15px] bg-[#924CCA] text-[35px] font-bold leading-[44px] text-white transition duration-300 hover:scale-105 hover:bg-[#7e3fb0]"
                >
                  Create CV →
                </button>
              </div>

              <Image
                src="/assets/cvs.png"
                alt="CV templates preview"
                width={771}
                height={946}
                priority
                className="absolute right-[-40px] top-[-35px] z-10 w-[771px] object-contain opacity-70 blur-[2.5px]"
              />

              <div className="absolute left-[103px] right-[103px] top-[1024px] z-30 flex items-center justify-between">
                <Image
                  src="/assets/udemy.png"
                  alt="Udemy"
                  width={119}
                  height={55}
                  className="h-[38px] w-auto object-contain"
                />

                <Image
                  src="/assets/edX.png"
                  alt="edX"
                  width={166}
                  height={60}
                  className="h-[38px] w-auto object-contain"
                />

                <Image
                  src="/assets/alison.png"
                  alt="Alison"
                  width={160}
                  height={35}
                  className="h-[30px] w-auto object-contain"
                />

                <Image
                  src="/assets/coursera.png"
                  alt="Coursera"
                  width={180}
                  height={62}
                  className="h-[44px] w-auto object-contain"
                />

                <Image
                  src="/assets/udacity.png"
                  alt="Udacity"
                  width={139}
                  height={58}
                  className="h-[44px] w-auto object-contain"
                />
              </div>
            </div>
          </section>

          {/* Why choose us */}
          <section id="features" className="px-8 py-24 md:px-[103px]">
            <p className="text-[20px] font-normal uppercase leading-[25px] text-[#924CCA]">
              Why choose us
            </p>

            <h2 className="mt-1 text-[32px] font-normal leading-tight md:text-[40px]">
              Everything you need. Nothing you don&apos;t.
            </h2>

            <div className="mt-10 grid gap-7 md:grid-cols-4">
              {featuresList.map((feature) => (
                <div
                  key={feature.title}
                  className="min-h-[268px] rounded-[47px] bg-white p-7 shadow-[0_4px_4px_#924CCA] transition duration-300 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(146,76,202,0.45)]"
                >
                  <div className="relative mb-7 h-[70px] w-[70px]">
                    <Image
                      src={feature.icon}
                      alt=""
                      fill
                      className="object-contain"
                    />
                  </div>

                  <h3 className="text-[20px] font-bold leading-[25px]">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-[16px] leading-[20px]">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mx-auto mt-12 grid max-w-[771px] grid-cols-3 text-center">
              <div>
                <p className="text-[40px] font-bold leading-[50px] text-[#924CCA]">
                  900 +
                </p>
                <p className="text-[18px] text-black/60 md:text-[20px]">
                  CVs created
                </p>
              </div>

              <div>
                <p className="text-[40px] font-bold leading-[50px] text-[#924CCA]">
                  95%
                </p>
                <p className="text-[18px] text-black/60 md:text-[20px]">
                  Interview rate
                </p>
              </div>

              <div>
                <p className="text-[40px] font-bold leading-[50px] text-[#924CCA]">
                  80 +
                </p>
                <p className="text-[18px] text-black/60 md:text-[20px]">
                  Templates
                </p>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="templates" className="px-8 py-24 md:px-[103px]">
            <p className="text-[20px] font-normal uppercase leading-[25px] text-[#924CCA]">
              How it works
            </p>

            <h2 className="mt-1 text-[32px] font-normal leading-tight md:text-[40px]">
              4 easy steps to create a perfect CV.
            </h2>

            <div className="mx-auto mt-14 grid max-w-[1069px] gap-14 md:grid-cols-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="mx-auto w-[202px] transition duration-300 hover:-translate-y-2"
                >
                  <div className="flex h-[107px] w-[177px] items-center justify-center bg-[#924CCA]">
                    <span className="text-[60px] font-bold leading-[73px] text-white">
                      0{index + 1}
                    </span>
                  </div>

                  <div className="min-h-[294px] w-[177px] bg-[#A86CD7]/20 px-3 pt-8 shadow-[0_20px_60px_rgba(168,108,215,0.55)]">
                    <h3 className="text-[23px] font-bold leading-[29px]">
                      {step}
                    </h3>

                    <p className="mt-8 text-[18px] leading-[23px]">
                      We offer a variety of simple or more professional
                      templates you can choose from.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section className="relative px-8 py-24 md:px-[103px]">
            <p className="text-[20px] font-normal uppercase leading-[25px] text-[#924CCA]">
              Testimonials
            </p>

            <h2 className="mt-1 text-[32px] font-normal leading-tight md:text-[40px]">
              Fresh grads. Real results.
            </h2>

            <button className="absolute left-2 top-[260px] hidden text-6xl transition duration-300 hover:scale-110 md:block">
              ◀
            </button>

            <button className="absolute right-2 top-[260px] hidden text-6xl transition duration-300 hover:scale-110 md:block">
              ▶
            </button>

            <div className="mt-14 grid gap-10 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="min-h-[144px] rounded-[47px] bg-white px-12 py-4 shadow-[0_4px_4px_#924CCA] transition duration-300 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(146,76,202,0.45)]"
                >
                  <p className="text-[25px] leading-[32px] text-[#924CCA]">
                    ★★★★★
                  </p>

                  <p className="mt-2 text-[12px] leading-[15px]">
                    “I had no idea how to write a CV. CVify turned my internship
                    bullet points into something I was actually proud to send
                    out.”
                    <br />
                    <br />
                    Sara L.
                    <br />
                    BSc Computer Science, 2025
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Smart tools */}
          <section id="jobs" className="px-8 py-24 md:px-[103px]">
            <p className="text-[20px] font-normal uppercase leading-[25px] text-[#924CCA]">
              Features
            </p>

            <h2 className="mt-1 text-[32px] font-normal leading-tight md:text-[40px]">
              Smart tools for job success!
            </h2>

            <div className="mt-14 grid gap-12 md:grid-cols-3">
              {tools.map((tool) => (
                <div
                  key={tool.title}
                  className="min-h-[232px] rounded-[47px] bg-white px-8 py-9 text-center shadow-[0_4px_4px_#924CCA] transition duration-300 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(146,76,202,0.45)]"
                >
                  <h3 className="mx-auto w-fit rounded-[20px] bg-[rgba(226,190,255,0.11)] px-7 py-2 text-[22px] leading-[30px] shadow-[inset_0_0_4px_2px_#924CCA] md:text-[24px]">
                    {tool.title}
                  </h3>

                  <p className="mt-7 text-[18px] leading-[23px]">
                    {tool.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-20 text-center">
              <button
                onClick={handleSeePlansClick}
                className="rounded-[15px] bg-[#924CCA] px-16 py-3 text-[24px] leading-[30px] text-white transition duration-300 hover:scale-105 hover:bg-[#7e3fb0]"
              >
                See our plans
              </button>
            </div>
          </section>
        </div>

        <Footer />
      </main>
    </PageTransition>
  );
}