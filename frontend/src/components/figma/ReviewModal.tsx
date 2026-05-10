"use client";
import { useState } from 'react';
import { X, Star } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: { rating: number; text: string; name: string; role: string }) => void;
}

export function ReviewModal({ isOpen, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0 && reviewText && name && role) {
      onSubmit({ rating, text: reviewText, name, role });
      setRating(0);
      setReviewText('');
      setName('');
      setRole('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-xl">
        {/* Close button — larger hit area, visually distinct */}
      <button
  onClick={onClose}
  className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full transition-colors shadow-sm"
  aria-label="Close"
>
  <X size={16} strokeWidth={2.5} />
</button>

        <h2 className="text-xl font-bold mb-0.5">Leave a Review</h2>
        <p className="text-sm text-foreground/60 mb-4">Share your experience with WireHire</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block mb-1.5 text-sm font-semibold">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={26}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Name + Role side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1.5 text-sm font-semibold">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-semibold">Role/Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                placeholder="Software Engineer"
                className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
              />
            </div>
          </div>

          {/* Review textarea — fewer rows */}
          <div>
            <label className="block mb-1.5 text-sm font-semibold">Your Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
              rows={4}
              placeholder="Tell us about your experience with WireHire..."
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#088395] text-white rounded-lg text-sm font-semibold hover:bg-[#076d7c] hover:shadow-md transition-all"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}