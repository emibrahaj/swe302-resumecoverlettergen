"use client";
import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { api } from '@/src/lib/api';

interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
}

const FALLBACK_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    rating: 5,
    text: 'DiversiHire helped me land my dream job at Google! The AI writing tool made my experience descriptions so much more impactful. Highly recommend!',
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Product Manager',
    rating: 5,
    text: 'The template variety is amazing and the resume strength analyzer gave me actionable insights. Got 3 interview calls within a week of using DiversiHire!',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    rating: 5,
    text: 'As a designer, I appreciate the beautiful templates and customization options. The cover letter builder is a game-changer. Worth every penny!',
  },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    api
      .get<Review[]>('/reviews/', { auth: false })
      .then((data) => {
        if (data && data.length > 0) setReviews(data);
      })
      .catch(() => {/* silently fall back to hardcoded */});
  }, []);

  const displayed = reviews.length > 0 ? reviews.slice(0, 3) : FALLBACK_REVIEWS;

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
            See what our users have to say about landing their dream jobs with DiversiHire
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {displayed.map((review) => (
            <div
              key={review.id}
              className="bg-[#088395]/5 rounded-2xl p-6 border-2 border-[#088395]/20 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#088395] rounded-full flex items-center justify-center text-white font-bold">
                  {getInitials(review.name)}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
