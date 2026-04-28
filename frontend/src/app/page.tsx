"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const router = useRouter();

  function handleCreateCVClick() {
    router.push("/resume-builder");
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
    {
      title: "Choose a template",
      text: "We offer a variety of simple or more professional templates you can choose from.",
    },
    {
      title: "Add your information",
      text: "Just fill in the fields about your education, skills and experience, we will make it look professional.",
    },
    {
      title: "Customise the look",
      text: "Our CV editor offers a variety of styles, fonts, colors and layouts.",
    },
    {
      title: "Download as PDF",
      text: "Save your draft, and it is ready to use.",
    },
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
    <main className="min-h-screen bg-white text-[#121212]">
      <Navbar />

      <div className="bg-[rgba(226,190,255,0.11)] shadow-[inset_0_0_15px_4px_#924CCA]">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="relative h-[1120px] w-full overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: -45 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-[103px] top-[270px] z-20 w-[710px]"
            >
              <h1 className="text-[60px] font-bold leading-[76px] text-[#121212]">
                Your career starts with the right{" "}
                <span className="text-[#924CCA]">first impression.</span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.55 }}
                className="mt-[11px] w-[579px] text-[24px] leading-[30px] text-black"
              >
                Paste your experience and let our AI craft a polished,
                job-ready CV in minutes.
              </motion.p>

              <motion.button
                whileHover={{ y: -4, scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleCreateCVClick}
                className="mt-[32px] h-[79px] w-[260px] rounded-[15px] bg-[#924CCA] text-[35px] font-bold leading-[44px] text-white transition duration-150 hover:bg-[#7a3bb0] active:scale-95 active:shadow-inner"
              >
                Create CV →
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50, rotate: 4 }}
              animate={{
                opacity: 1,
                x: 0,
                rotate: 0,
                y: [0, -14, 0],
              }}
              transition={{
                opacity: { duration: 0.75 },
                x: { duration: 0.75 },
                rotate: { duration: 0.75 },
                y: {
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="absolute right-[-40px] top-[-35px] z-10 w-[771px]"
            >
              <Image
                src="/assets/cvs.png"
                alt="CV templates preview"
                width={771}
                height={946}
                priority
                className="w-full object-contain opacity-70 blur-[2.5px]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.65 }}
              className="absolute left-[103px] right-[103px] top-[1024px] z-30 flex items-center justify-between"
            >
              {[
                ["/assets/udemy.png", "Udemy", 119, 55, "h-[38px]"],
                ["/assets/edX.png", "edX", 166, 60, "h-[38px]"],
                ["/assets/alison.png", "Alison", 160, 35, "h-[30px]"],
                ["/assets/coursera.png", "Coursera", 180, 62, "h-[44px]"],
                ["/assets/udacity.png", "Udacity", 139, 58, "h-[44px]"],
              ].map(([src, alt, width, height, className]) => (
                <motion.div
                  key={String(alt)}
                  whileHover={{ y: -5, scale: 1.08 }}
                  transition={{ duration: 0.2 }}
                >
                  <Image
                    src={String(src)}
                    alt={String(alt)}
                    width={Number(width)}
                    height={Number(height)}
                    className={`${String(className)} w-auto object-contain`}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Why choose us */}
        <section id="features" className="px-8 py-24 md:px-[103px]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[20px] font-normal uppercase leading-[25px] text-[#924CCA]">
              Why choose us
            </p>

            <h2 className="mt-1 text-[32px] font-normal leading-tight md:text-[40px]">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-7 md:grid-cols-4">
            {featuresList.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="min-h-[268px] rounded-[47px] bg-white p-7 shadow-[0_4px_4px_#924CCA]"
              >
                <motion.div
                  whileHover={{ rotate: 4, scale: 1.08 }}
                  transition={{ duration: 0.2 }}
                  className="relative mb-7 h-[70px] w-[70px]"
                >
                  <Image
                    src={feature.icon}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </motion.div>

                <h3 className="text-[20px] font-bold leading-[25px]">
                  {feature.title}
                </h3>

                <p className="mt-3 text-[16px] leading-[20px]">
                  {feature.text}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
            className="mx-auto mt-12 grid max-w-[771px] grid-cols-3 text-center"
          >
            {[
              ["900 +", "CVs created"],
              ["95%", "Interview rate"],
              ["80 +", "Templates"],
            ].map(([number, label], index) => (
              <motion.div
                key={label}
                whileHover={{ y: -6, scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.4 }}
                  className="text-[40px] font-bold leading-[50px] text-[#924CCA]"
                >
                  {number}
                </motion.p>
                <p className="text-[18px] text-black/60 md:text-[20px]">
                  {label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* How it works */}
        <section id="templates" className="px-8 py-24 md:px-[103px]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[20px] font-normal uppercase leading-[25px] text-[#924CCA]">
              How it works
            </p>

            <h2 className="mt-1 text-[32px] font-normal leading-tight md:text-[40px]">
              4 easy steps to create a perfect CV.
            </h2>
          </motion.div>

          <div className="mx-auto mt-14 grid max-w-[1069px] gap-14 md:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -10 }}
                className="mx-auto w-[202px]"
              >
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  className="flex h-[107px] w-[177px] items-center justify-center bg-[#924CCA]"
                >
                  <span className="text-[60px] font-bold leading-[73px] text-white">
                    0{index + 1}
                  </span>
                </motion.div>

                <div className="min-h-[294px] w-[177px] bg-[#A86CD7]/20 px-3 pt-8 shadow-[0_20px_60px_rgba(168,108,215,0.55)]">
                  <h3 className="text-[23px] font-bold leading-[29px]">
                    {step.title}
                  </h3>

                  <p className="mt-8 text-[18px] leading-[23px]">
                    {step.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative px-8 py-24 md:px-[103px]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[20px] font-normal uppercase leading-[25px] text-[#924CCA]">
              Testimonials
            </p>

            <h2 className="mt-1 text-[32px] font-normal leading-tight md:text-[40px]">
              Fresh grads. Real results.
            </h2>
          </motion.div>

          <motion.button
            whileHover={{ x: -4, scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="absolute left-2 top-[260px] hidden text-6xl md:block"
          >
            ◀
          </motion.button>

          <motion.button
            whileHover={{ x: 4, scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-2 top-[260px] hidden text-6xl md:block"
          >
            ▶
          </motion.button>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[1, 2, 3].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="min-h-[144px] rounded-[47px] bg-white px-12 py-4 shadow-[0_4px_4px_#924CCA]"
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
              </motion.div>
            ))}
          </div>
        </section>

        {/* Smart tools */}
        <section id="jobs" className="px-8 py-24 md:px-[103px]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[20px] font-normal uppercase leading-[25px] text-[#924CCA]">
              Features
            </p>

            <h2 className="mt-1 text-[32px] font-normal leading-tight md:text-[40px]">
              Smart tools for job success!
            </h2>
          </motion.div>

          <div className="mt-14 grid gap-12 md:grid-cols-3">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="min-h-[232px] rounded-[47px] bg-white px-8 py-9 text-center shadow-[0_4px_4px_#924CCA]"
              >
                <motion.h3
                  whileHover={{ scale: 1.03 }}
                  className="mx-auto w-fit rounded-[20px] bg-[rgba(226,190,255,0.11)] px-7 py-2 text-[22px] leading-[30px] shadow-[inset_0_0_4px_2px_#924CCA] md:text-[24px]"
                >
                  {tool.title}
                </motion.h3>

                <p className="mt-7 text-[18px] leading-[23px]">{tool.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <motion.button
              whileHover={{ y: -4, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSeePlansClick}
              className="rounded-[15px] bg-[#924CCA] px-16 py-3 text-[24px] leading-[30px] text-white transition hover:opacity-90"
            >
              See our plans
            </motion.button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}