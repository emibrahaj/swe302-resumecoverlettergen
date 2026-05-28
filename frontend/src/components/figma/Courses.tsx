"use client";
import React, { useState } from 'react';
import { BookOpen, Star, TrendingUp, Award, Code, Database, X, Clock, Users, CheckCircle, Tag, Bell, Mail, Loader2 } from 'lucide-react';
import { useLanguage } from "@/src/context/LanguageContext";
import { api, ApiError } from "@/src/lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface CourseMeta {
  provider: string;
  originalPrice: string;
  discountedPrice: string;
  discount: string;
  rating: number;
  students: string;
  icon: React.ElementType;
  color: string;
  instructor: string;
}

const courseMeta: CourseMeta[] = [
  {
    provider: 'AWS Training',
    originalPrice: '$299',
    discountedPrice: '$199',
    discount: '33% OFF',
    rating: 4.8,
    students: '125K+',
    icon: TrendingUp,
    color: 'bg-orange-100 text-orange-600',
    instructor: 'Ryan Kroonenburg',
  },
  {
    provider: 'Educative',
    originalPrice: '$79',
    discountedPrice: '$59',
    discount: '25% OFF',
    rating: 4.9,
    students: '50K+',
    icon: Award,
    color: 'bg-blue-100 text-blue-600',
    instructor: 'Donne Martin',
  },
  {
    provider: 'Pluralsight',
    originalPrice: '$49',
    discountedPrice: '$29',
    discount: '40% OFF',
    rating: 4.7,
    students: '80K+',
    icon: Code,
    color: 'bg-purple-100 text-purple-600',
    instructor: 'Mumshad Mannambeth',
  },
  {
    provider: 'Frontend Masters',
    originalPrice: '$59',
    discountedPrice: '$39',
    discount: '33% OFF',
    rating: 4.9,
    students: '95K+',
    icon: BookOpen,
    color: 'bg-teal-100 text-teal-600',
    instructor: 'Stephen Grider',
  },
  {
    provider: 'DataCamp',
    originalPrice: '$89',
    discountedPrice: '$59',
    discount: '33% OFF',
    rating: 4.8,
    students: '110K+',
    icon: Database,
    color: 'bg-green-100 text-green-600',
    instructor: 'Jose Portilla',
  },
  {
    provider: 'Udemy',
    originalPrice: '$99',
    discountedPrice: '$69',
    discount: '30% OFF',
    rating: 4.7,
    students: '200K+',
    icon: Code,
    color: 'bg-pink-100 text-pink-600',
    instructor: 'Angela Yu',
  }
];

export function Courses() {
  const { t } = useLanguage();
  const [selectedCourseIndex, setSelectedCourseIndex] = useState<number | null>(null);
  const courses = courseMeta.map((meta, index) => ({
    ...meta,
    ...t.coursesPage.items[index],
  }));
  const selectedCourse = selectedCourseIndex === null ? null : courses[selectedCourseIndex];

  // ── "Coming Soon" notification sign-up ──────────────────────────────────
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySubmitting, setNotifySubmitting] = useState(false);
  const [notifySubscribed, setNotifySubscribed] = useState(false);
  const [notifyError, setNotifyError] = useState<string | null>(null);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (notifySubmitting) return;
    const email = notifyEmail.trim();
    if (!EMAIL_RE.test(email)) {
      setNotifyError("Please enter a valid email address.");
      return;
    }
    setNotifySubmitting(true);
    setNotifyError(null);
    try {
      await api.post("/course-notifications/subscribe", { email }, { auth: false });
      setNotifySubscribed(true);
    } catch (err) {
      setNotifyError(
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setNotifySubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-r from-[#088395] to-teal-600 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t.coursesPage.heroTitle}
          </h1>
          <p className="text-white/90">
            {t.coursesPage.heroSubtitle}
          </p>
        </div>
      </div>

              {/* Coming Soon — Get Notification */}
<div className="mt-12 max-w-4xl mx-auto bg-gradient-to-r from-[#088395] to-teal-600 rounded-2xl shadow-xl px-6 py-5 text-center text-white">
  <div className="w-16 h-16 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-4">
    <Bell size={30} className="text-white" />
          </div>
          <span className="inline-block px-3 py-1 bg-white/15 rounded-full text-xs font-bold mb-3 uppercase tracking-wide">
            Coming Soon
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Certified Online Courses on Their Way</h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Leave your email and we&apos;ll notify you the moment that courses will be available.
          </p>

          {notifySubscribed ? (
            <div className="flex items-center justify-center gap-2 font-semibold">
              <CheckCircle size={20} />
              You&apos;re on the list! We&apos;ll notify you about new courses.
            </div>
          ) : (
            <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={notifyEmail}
                  onChange={(e) => { setNotifyEmail(e.target.value); setNotifyError(null); }}
                  placeholder="you@example.com"
                  aria-label="Email address"
                  className="w-full pl-9 pr-4 py-3 rounded-lg text-foreground text-sm bg-white focus:outline-none focus:ring-2 focus:ring-white/70"
                />
              </div>
              <button
                type="submit"
                disabled={notifySubmitting}
                className="px-6 py-3 bg-white text-[#088395] rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {notifySubmitting && <Loader2 size={16} className="animate-spin" />}
                {notifySubmitting ? "Submitting…" : "Get Notification"}
              </button>
            </form>
          )}

          {notifyError && (
            <p className="mt-3 inline-block bg-red-500/30 rounded-lg py-2 px-3 text-sm">
              {notifyError}
            </p>
          )}
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {courses.map((course, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-[#088395] transition-all transform hover:scale-105 cursor-pointer group"
            >
              <div className="p-6">
                <div className={`w-14 h-14 ${course.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <course.icon size={28} />
                </div>

                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold mb-3">
                    {course.discount}
                  </span>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-[#088395] transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-foreground/70">{course.provider}</p>
                    <span className="text-xs px-2 py-1 bg-[#088395]/10 text-[#088395] rounded-full">
                      {course.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{course.rating}</span>
                  </div>
                  <span className="text-foreground/50">•</span>
                  <span className="text-foreground/70">{course.students} {t.coursesPage.students}</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-[#088395]">{course.discountedPrice}</span>
                  <span className="text-lg text-foreground/50 line-through">{course.originalPrice}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCourseIndex(index)}
                    className="flex-1 py-3 border-2 border-[#088395] text-[#088395] rounded-lg font-semibold hover:bg-[#088395]/5 transition-all"
                  >
                    {t.coursesPage.viewCourse}
                  </button>
                  <button className="flex-1 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    {t.coursesPage.enrollNow}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t.coursesPage.whyChoose}</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="w-16 h-16 bg-[#088395]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={32} className="text-[#088395]" />
              </div>
              <h3 className="font-semibold mb-2">{t.coursesPage.benefits[0].title}</h3>
              <p className="text-sm text-foreground/70">{t.coursesPage.benefits[0].description}</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-[#088395]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-[#088395]" />
              </div>
              <h3 className="font-semibold mb-2">{t.coursesPage.benefits[1].title}</h3>
              <p className="text-sm text-foreground/70">{t.coursesPage.benefits[1].description}</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-[#088395]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="text-[#088395]" />
              </div>
              <h3 className="font-semibold mb-2">{t.coursesPage.benefits[2].title}</h3>
              <p className="text-sm text-foreground/70">{t.coursesPage.benefits[2].description}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] relative flex flex-col">

            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <button
                onClick={() => setSelectedCourseIndex(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-start gap-4 pr-10">
                <div className={`w-14 h-14 ${selectedCourse.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <selectedCourse.icon size={28} />
                </div>
                <div>
                  <span className="inline-block px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold mb-1">
                    {selectedCourse.discount}
                  </span>
                  <h2 className="text-xl font-bold leading-snug">{selectedCourse.title}</h2>
                  <p className="text-sm text-foreground/70 mt-0.5">{selectedCourse.provider}</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-foreground/70">
                <div className="flex items-center gap-1">
                  <Star size={15} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-foreground">{selectedCourse.rating}</span>
                  <span>{t.coursesPage.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={15} />
                  <span>{selectedCourse.students} {t.coursesPage.students}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={15} />
                  <span>{selectedCourse.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Tag size={15} />
                  <span>{selectedCourse.category}</span>
                </div>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="p-6 overflow-y-scroll flex-1 overscroll-contain space-y-6">

              {/* Description */}
              <div>
                <h3 className="font-semibold text-base mb-2">{t.coursesPage.aboutCourse}</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{selectedCourse.description}</p>
              </div>

              {/* Instructor */}
              <div>
                <h3 className="font-semibold text-base mb-2">{t.coursesPage.instructor}</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#088395]/10 flex items-center justify-center text-[#088395] font-bold text-sm">
                    {selectedCourse.instructor.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm font-medium">{selectedCourse.instructor}</span>
                </div>
              </div>

              {/* What you'll learn */}
              <div>
                <h3 className="font-semibold text-base mb-3">{t.coursesPage.whatYouLearn}</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {selectedCourse.whatYouLearn.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle size={16} className="text-[#088395] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="font-semibold text-base mb-3">{t.coursesPage.requirements}</h3>
                <ul className="space-y-2">
                  {selectedCourse.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#088395] mt-2 flex-shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground/70 mb-1">{t.coursesPage.coursePrice}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#088395]">{selectedCourse.discountedPrice}</span>
                    <span className="text-base text-foreground/40 line-through">{selectedCourse.originalPrice}</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">{selectedCourse.discount}</span>
                  </div>
                </div>
                <button className="px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  {t.coursesPage.enrollNow}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
