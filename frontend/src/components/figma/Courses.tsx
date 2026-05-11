"use client";
import React, { useState } from 'react';
import { BookOpen, Star, TrendingUp, Award, Code, Database, X, Clock, Users, CheckCircle, Tag } from 'lucide-react';

interface Course {
  title: string;
  provider: string;
  originalPrice: string;
  discountedPrice: string;
  discount: string;
  rating: number;
  students: string;
  icon: React.ElementType;
  color: string;
  category: string;
  description: string;
  instructor: string;
  duration: string;
  requirements: string[];
  whatYouLearn: string[];
}

const courses: Course[] = [
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
    category: 'Cloud Computing',
    description: 'Prepare for the AWS Certified Solutions Architect – Associate exam with hands-on labs, real-world scenarios, and comprehensive coverage of core AWS services including EC2, S3, RDS, VPC, and more.',
    instructor: 'Ryan Kroonenburg',
    duration: '40 hours',
    requirements: ['Basic understanding of IT concepts', 'Familiarity with networking fundamentals', 'No prior AWS experience required'],
    whatYouLearn: ['Design resilient, high-performing architectures', 'Deploy secure and robust AWS applications', 'Define cost-optimized cloud solutions', 'Pass the AWS SAA-C03 exam']
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
    category: 'Interview Prep',
    description: 'Master system design concepts to ace interviews at top tech companies like Google, Amazon, and Meta. Covers scalability, load balancing, databases, caching, and distributed systems with real interview questions.',
    instructor: 'Donne Martin',
    duration: '25 hours',
    requirements: ['Basic programming knowledge', 'Understanding of basic data structures', 'Familiarity with web concepts'],
    whatYouLearn: ['Design scalable distributed systems', 'Tackle real-world system design questions', 'Understand trade-offs in architecture decisions', 'Confidently approach FAANG interviews']
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
    category: 'DevOps',
    description: 'Learn to build, test, and deploy applications automatically using modern DevOps tools. Hands-on projects with Docker, Kubernetes, Jenkins, GitHub Actions, and Terraform for real-world CI/CD pipelines.',
    instructor: 'Mumshad Mannambeth',
    duration: '35 hours',
    requirements: ['Basic Linux command line knowledge', 'Familiarity with any programming language', 'Basic understanding of version control (Git)'],
    whatYouLearn: ['Build complete CI/CD pipelines from scratch', 'Containerize applications with Docker', 'Orchestrate containers with Kubernetes', 'Automate infrastructure with Terraform']
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
    category: 'Programming',
    description: 'Go from TypeScript beginner to advanced developer. Covers type systems, generics, decorators, and integrating TypeScript with React, Node.js, and popular frameworks used in production applications.',
    instructor: 'Stephen Grider',
    duration: '27 hours',
    requirements: ['JavaScript fundamentals (ES6+)', 'Basic understanding of OOP concepts', 'Node.js installed on your machine'],
    whatYouLearn: ['Master TypeScript type system and generics', 'Build full-stack apps with TypeScript', 'Integrate TypeScript with React and Node', 'Write safer, more maintainable code']
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
    category: 'Data Science',
    description: 'A comprehensive introduction to data science and machine learning using Python. Covers data wrangling with Pandas, visualization with Matplotlib, and building ML models with Scikit-learn and TensorFlow.',
    instructor: 'Jose Portilla',
    duration: '50 hours',
    requirements: ['Basic Python knowledge', 'High school level mathematics', 'No prior data science experience needed'],
    whatYouLearn: ['Clean and analyze data with Pandas & NumPy', 'Build and evaluate ML models', 'Create compelling data visualizations', 'Apply deep learning with TensorFlow']
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
    category: 'Web Development',
    description: 'Build modern full-stack web applications from scratch. Covers HTML, CSS, JavaScript, React, Node.js, Express, MongoDB, and deployment — everything you need to land your first developer job.',
    instructor: 'Angela Yu',
    duration: '65 hours',
    requirements: ['No prior coding experience required', 'A computer with internet access', 'Eagerness to learn and build projects'],
    whatYouLearn: ['Build responsive frontends with React', 'Create RESTful APIs with Node & Express', 'Work with SQL and NoSQL databases', 'Deploy apps to the web']
  }
];

export function Courses() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#088395] to-teal-600 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">
            Upskill with Premium Courses
          </h1>
          <p className="text-white/90">
            Get exclusive discounts on industry-leading courses to boost your career
          </p>
        </div>
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
                  <span className="text-foreground/70">{course.students} students</span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-[#088395]">{course.discountedPrice}</span>
                  <span className="text-lg text-foreground/50 line-through">{course.originalPrice}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="flex-1 py-3 border-2 border-[#088395] text-[#088395] rounded-lg font-semibold hover:bg-[#088395]/5 transition-all"
                  >
                    View Course
                  </button>
                  <button className="flex-1 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Why Choose Our Partner Courses?</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="w-16 h-16 bg-[#088395]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={32} className="text-[#088395]" />
              </div>
              <h3 className="font-semibold mb-2">Industry-Recognized Certificates</h3>
              <p className="text-sm text-foreground/70">Earn credentials that employers value</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-[#088395]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} className="text-[#088395]" />
              </div>
              <h3 className="font-semibold mb-2">Boost Your Resume</h3>
              <p className="text-sm text-foreground/70">Add valuable skills to stand out</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-[#088395]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star size={32} className="text-[#088395]" />
              </div>
              <h3 className="font-semibold mb-2">Exclusive Discounts</h3>
              <p className="text-sm text-foreground/70">Save up to 40% on premium courses</p>
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
                onClick={() => setSelectedCourse(null)}
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
                  <span>rating</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={15} />
                  <span>{selectedCourse.students} students</span>
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
                <h3 className="font-semibold text-base mb-2">About this course</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{selectedCourse.description}</p>
              </div>

              {/* Instructor */}
              <div>
                <h3 className="font-semibold text-base mb-2">Instructor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#088395]/10 flex items-center justify-center text-[#088395] font-bold text-sm">
                    {selectedCourse.instructor.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm font-medium">{selectedCourse.instructor}</span>
                </div>
              </div>

              {/* What you'll learn */}
              <div>
                <h3 className="font-semibold text-base mb-3">What you&apos;ll learn</h3>
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
                <h3 className="font-semibold text-base mb-3">Requirements</h3>
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
                  <p className="text-sm text-foreground/70 mb-1">Course price</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#088395]">{selectedCourse.discountedPrice}</span>
                    <span className="text-base text-foreground/40 line-through">{selectedCourse.originalPrice}</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs font-bold">{selectedCourse.discount}</span>
                  </div>
                </div>
                <button className="px-6 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all">
                  Enroll Now
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}