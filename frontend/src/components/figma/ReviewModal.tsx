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
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-2">Leave a Review</h2>
        <p className="text-foreground/70 mb-6">Share your experience with WireHire</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-semibold">Your Rating</label>
            <div className="flex gap-2">
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
                    size={32}
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

          <div>
            <label className="block mb-2 text-sm font-semibold">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold">Your Role/Title</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              placeholder="Software Engineer"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold">Your Review</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
              rows={6}
              placeholder="Tell us about your experience with WireHire..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
