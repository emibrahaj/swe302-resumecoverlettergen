"use client";
import { Star, Quote } from 'lucide-react';
import {useLanguage} from "@/src/context/LanguageContext";
import {ScrollFadeInGroup, ScrollFadeInItem} from "@/src/components/figma/ScrollFadeIn";

const reviews = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Software Engineer',
    company: 'Google',
    rating: 5,
    avatar: 'SJ'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Product Manager',
    company: 'Amazon',
    rating: 5,
    avatar: 'MC'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'UX Designer',
    company: 'Apple',
    rating: 5,
    avatar: 'ER'
  }
];

export function Reviews() {
  const {t} = useLanguage();

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
            {t.reviews.heading}
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            {t.reviews.subheading}
          </p>
        </div>

        <ScrollFadeInGroup
          staggerDelay={0.12}
          className="grid md:grid-cols-3 gap-8"
        >
          {reviews.map((review, index) => (
            <ScrollFadeInItem
              key={review.id}
              direction="up"
              distance={24}
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
              <p className="text-foreground/80 pl-6">{t.reviews.items[index]}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-[#088395]/20">
                <p className="text-sm font-semibold text-[#088395]">
                  {t.reviews.nowAt} {review.company}
                </p>
              </div>
            </ScrollFadeInItem>
          ))}
        </ScrollFadeInGroup>
      </div>
    </section>
  );
}
