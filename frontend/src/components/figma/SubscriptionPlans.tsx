import { Check, Sparkles, ArrowLeft } from 'lucide-react';

const premiumFeatures = [
  'Unlimited resumes & cover letters',
  'AI-powered writing assistant',
  'Resume strength analyzer',
  'Personalized job recommendations',
  'ATS optimization tools',
  'Priority customer support',
];

const plans = [
  {
    name: 'Weekly',
    price: '$4.99',
    period: '/week',
    description: 'Perfect for quick job searches',
    cta: 'Start Weekly Plan',
    popular: true,
    savings: null
  },
  {
    name: 'Monthly',
    price: '$14.99',
    period: '/month',
    description: 'Best value for active job seekers',
    cta: 'Start Monthly Plan',
    popular: false,
    savings: 'Save 25%'
  },
  {
    name: '6-Months',
    price: '$59.99',
    period: '/6 months',
    description: 'Maximum savings for long-term access',
    cta: 'Start 6-Month Plan',
    popular: false,
    savings: 'Save 50%'
  }
];

interface SubscriptionPlansProps {
  onBack: () => void;
  onSelectPlan: (planName: string) => void;
}

export function SubscriptionPlans({ onBack, onSelectPlan }: SubscriptionPlansProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground/70 hover:text-foreground mb-8"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* All Premium Plans Include — Spotify-style banner */}
        <div className="rounded-2xl overflow-hidden mb-12" style={{ background: 'linear-gradient(135deg, #055f6b 0%, #088395 60%, #0aa3b5 100%)' }}>
          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-0">
            {/* Left: heading */}
            <div className="flex items-center justify-center md:justify-start px-10 py-12 md:w-2/5">
              <h1 className="text-white text-3xl md:text-4xl lg:text-5xl leading-tight" style={{ fontWeight: 800 }}>
                All Premium<br />plans include
              </h1>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-white/20 my-8" />

            {/* Right: feature checklist */}
            <div className="flex flex-col justify-center px-10 py-12 md:w-3/5">
              <ul className="space-y-4">
                {premiumFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check size={20} className="text-white flex-shrink-0" strokeWidth={3} />
                    <span className="text-white text-base md:text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Choose Your Duration</h2>
          <p className="text-foreground/70">All plans include the same premium features</p>
        </div>

        {/* Pricing Plans */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-b from-[#088395] to-teal-600 text-white shadow-2xl scale-105 border-4 border-[#088395]'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-purple-900 rounded-full flex items-center gap-1">
                  <Sparkles size={14} />
                  <span className="text-sm font-semibold">Most Popular</span>
                </div>
              )}

              {plan.savings && !plan.popular && (
                <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                  {plan.savings}
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className={plan.popular ? 'text-white/90' : 'text-foreground/70'}>
                  {plan.description}
                </p>
              </div>

              <div className="text-center mb-6">
                <div className="mb-2">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-lg">{plan.period}</span>
                </div>
                {plan.name === 'Weekly' && (
                  <p className={`text-sm ${plan.popular ? 'text-white/80' : 'text-foreground/60'}`}>
                    ${(parseFloat(plan.price.slice(1)) * 4.33).toFixed(2)}/month equivalent
                  </p>
                )}
                {plan.name === '6-Months' && (
                  <p className={`text-sm ${plan.popular ? 'text-white/80' : 'text-foreground/60'}`}>
                    ${(parseFloat(plan.price.slice(1)) / 6).toFixed(2)}/month
                  </p>
                )}
              </div>

              <button
                onClick={() => onSelectPlan(plan.name)}
                className={`w-full py-4 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'bg-white text-[#088395] hover:shadow-xl'
                    : 'bg-[#088395] text-white hover:shadow-lg'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-foreground/70 mb-4">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
          <p className="text-sm text-foreground/50">
            Questions? Contact our sales team at diversihire@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
