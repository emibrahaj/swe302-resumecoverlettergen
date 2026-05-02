"use client";
import { Star, Quote } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    company: 'Google',
    rating: 5,
    text: 'CVify helped me land my dream job at Google! The AI writing tool made my experience descriptions so much more impactful. Highly recommend!',
    avatar: 'SJ'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Product Manager',
    company: 'Amazon',
    rating: 5,
    text: 'The template variety is amazing and the resume strength analyzer gave me actionable insights. Got 3 interview calls within a week of using CVify!',
    avatar: 'MC'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    company: 'Apple',
    rating: 5,
    text: 'As a designer, I appreciate the beautiful templates and customization options. The cover letter builder is a game-changer. Worth every penny!',
    avatar: 'ER'
  }
];

export function Reviews() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={32} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Trusted by 50,000+ Job Seekers
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            See what our users have to say about landing their dream jobs with CVify
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-[#088395]/5 rounded-2xl p-6 border-2 border-[#088395]/20 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#088395] rounded-full flex items-center justify-center text-white font-bold">
                  {review.avatar}
                </div>
                <div>
                  <h4 className="font-semibold">{review.name}</h4>
                  <p className="text-sm text-foreground/70">{review.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <div className="relative">
                <Quote size={24} className="text-[#088395]/30 absolute -top-2 -left-2" />
                <p className="text-foreground/80 pl-6">{review.text}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-[#088395]/20">
                <p className="text-sm font-semibold text-[#088395]">
                  Now at {review.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
