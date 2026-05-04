"use client";
import {Award, BookOpen, Code, Database, Star, TrendingUp} from 'lucide-react';

const courses = [
    {
        title: 'AWS Certified Solutions Architect',
        provider: 'AWS Training',
        originalPrice: '$299',
        discountedPrice: '$199',
        discount: '33% OFF',
        rating: 4.8,
        students: '125K+',
        icon: TrendingUp,
        color: 'bg-orange-100 text-orange-600',
        category: 'Cloud Computing'
    },
    {
        title: 'System Design Interview Masterclass',
        provider: 'Educative',
        originalPrice: '$79',
        discountedPrice: '$59',
        discount: '25% OFF',
        rating: 4.9,
        students: '50K+',
        icon: Award,
        color: 'bg-blue-100 text-blue-600',
        category: 'Interview Prep'
    },
    {
        title: 'Complete DevOps & CI/CD Pipeline',
        provider: 'Pluralsight',
        originalPrice: '$49',
        discountedPrice: '$29',
        discount: '40% OFF',
        rating: 4.7,
        students: '80K+',
        icon: Code,
        color: 'bg-purple-100 text-purple-600',
        category: 'DevOps'
    },
    {
        title: 'TypeScript: Complete Developer Guide',
        provider: 'Frontend Masters',
        originalPrice: '$59',
        discountedPrice: '$39',
        discount: '33% OFF',
        rating: 4.9,
        students: '95K+',
        icon: BookOpen,
        color: 'bg-teal-100 text-teal-600',
        category: 'Programming'
    },
    {
        title: 'Data Science & Machine Learning',
        provider: 'DataCamp',
        originalPrice: '$89',
        discountedPrice: '$59',
        discount: '33% OFF',
        rating: 4.8,
        students: '110K+',
        icon: Database,
        color: 'bg-green-100 text-green-600',
        category: 'Data Science'
    },
    {
        title: 'Full Stack Web Development',
        provider: 'Udemy',
        originalPrice: '$99',
        discountedPrice: '$69',
        discount: '30% OFF',
        rating: 4.7,
        students: '200K+',
        icon: Code,
        color: 'bg-pink-100 text-pink-600',
        category: 'Web Development'
    }
];

export function Courses() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-cyan-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#088395]/10 rounded-full mb-4">
                        <BookOpen size={20} className="text-[#088395]"/>
                        <span className="text-sm text-[#088395] font-semibold">Exclusive Partner Discounts</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-black">
                        Upskill with Premium Courses
                    </h1>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                        Get exclusive discounts on industry-leading courses to boost your career and strengthen your
                        resume
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {courses.map((course, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-[#088395] transition-all transform hover:scale-105 cursor-pointer group"
                        >
                            <div className="p-6">
                                <div
                                    className={`w-14 h-14 ${course.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <course.icon size={28}/>
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
                                        <Star size={16} className="text-yellow-500 fill-yellow-500"/>
                                        <span className="font-semibold">{course.rating}</span>
                                    </div>
                                    <span className="text-foreground/50">•</span>
                                    <span className="text-foreground/70">{course.students} students</span>
                                </div>

                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-2xl font-bold text-[#088395]">{course.discountedPrice}</span>
                                    <span
                                        className="text-lg text-foreground/50 line-through">{course.originalPrice}</span>
                                </div>

                                <button
                                    className="w-full py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                                    Enroll Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Why Choose Our Partner Courses?</h2>
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <div
                                className="w-16 h-16 bg-[#088395]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award size={32} className="text-[#088395]"/>
                            </div>
                            <h3 className="font-semibold mb-2">Industry-Recognized Certificates</h3>
                            <p className="text-sm text-foreground/70">Earn credentials that employers value</p>
                        </div>
                        <div>
                            <div
                                className="w-16 h-16 bg-[#088395]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp size={32} className="text-[#088395]"/>
                            </div>
                            <h3 className="font-semibold mb-2">Boost Your Resume</h3>
                            <p className="text-sm text-foreground/70">Add valuable skills to stand out</p>
                        </div>
                        <div>
                            <div
                                className="w-16 h-16 bg-[#088395]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Star size={32} className="text-[#088395]"/>
                            </div>
                            <h3 className="font-semibold mb-2">Exclusive Discounts</h3>
                            <p className="text-sm text-foreground/70">Save up to 40% on premium courses</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
