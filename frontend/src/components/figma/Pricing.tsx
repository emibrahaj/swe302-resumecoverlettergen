"use client";
import {ArrowLeft, Check, Sparkles} from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      'Access to all templates',
      'Basic AI writing assistance',
      'PDF export',
      'Unlimited edits',
      'No account required'
    ],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'Best for job seekers',
    features: [
      'Everything in Free',
      'Save unlimited resumes',
      'Create cover letters',
      'Resume strength analyzer',
      'Personalized improvement suggestions',
      'Job recommendations by location',
      'ATS optimization',
      'Priority support'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Company',
    price: 'Custom',
    description: 'For verified companies',
    features: [
      'Post job openings',
      'Manage multiple positions',
      'Candidate matching',
      'Application tracking',
      'Team collaboration',
      'Analytics dashboard'
    ],
    cta: 'Contact Sales',
    popular: false
  }
];

interface PricingProps {
    onBack?: () => void;
}

export function Pricing({ onBack }: PricingProps & { onBack?: () => void}) {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
          {onBack && (
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-foreground/70 hover:text-foreground mb-8"
                    >
                        <ArrowLeft size={20}/>
                        Back to Home
                    </button>
                )}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-foreground/70">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-b bg-[#088395] text-white shadow-2xl scale-105'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-purple-900 rounded-full flex items-center gap-1">
                  <Sparkles size={14} />
                  <span className="text-sm font-semibold">Most Popular</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={plan.popular ? 'text-purple-100' : 'text-foreground/70'}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-xl">{plan.period}</span>}
              </div>

              <button
                className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all ${
                  plan.popular
                    ? 'bg-white text-[#088395] hover:bg-[#088395]/5'
                    : 'bg-[#088395] text-white hover:shadow-lg'
                }`}
              >
                {plan.cta}
              </button>

              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check
                      size={20}
                      className={`flex-shrink-0 mt-0.5 ${
                        plan.popular ? 'text-white' : 'text-[#088395]'
                      }`}
                    />
                    <span className={plan.popular ? 'text-purple-100' : 'text-foreground/70'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
