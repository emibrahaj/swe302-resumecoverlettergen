"use client";
import { useState } from 'react';
import { ArrowLeft, CreditCard, Lock, Check } from 'lucide-react';

interface PaymentProps {
  planName: string;
  planPrice: string;
  onBack: () => void;
  onComplete: () => void;
}

export function Payment({ planName, planPrice, onBack, onComplete }: PaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-foreground/70 hover:text-foreground mb-8"
        >
          <ArrowLeft size={20} />
          Back to Plans
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#088395]/10 rounded-full flex items-center justify-center">
                <CreditCard size={24} className="text-[#088395]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Payment Details</h2>
                <p className="text-foreground/70">Secure checkout with SSL encryption</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-semibold">Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#088395] bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <CreditCard size={24} className="mx-auto mb-2" />
                  <p className="text-sm font-semibold">Credit Card</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-[#088395] bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl font-bold text-blue-600 mb-2">PayPal</div>
                  <p className="text-sm font-semibold">PayPal</p>
                </button>
              </div>
            </div>

            {paymentMethod === 'card' && (
              <form className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-semibold">Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold">Billing Address</label>
                  <input
                    type="text"
                    placeholder="Street Address"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none mb-4"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="City"
                      className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <Lock size={20} className="text-green-600" />
                  <p className="text-sm text-green-700">
                    Your payment information is encrypted and secure
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onComplete}
                  className="w-full py-4 bg-[#088395] text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                >
                  Complete Payment
                </button>
              </form>
            )}

            {paymentMethod === 'paypal' && (
              <div className="text-center py-12">
                <div className="text-6xl text-blue-600 mb-4">PayPal</div>
                <p className="text-foreground/70 mb-8">
                  You will be redirected to PayPal to complete your purchase
                </p>
                <button
                  onClick={onComplete}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:shadow-xl transition-all"
                >
                  Continue to PayPal
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <div>
                    <p className="font-semibold">{planName} Plan</p>
                    <p className="text-sm text-foreground/70">Billed monthly</p>
                  </div>
                  <p className="font-semibold">{planPrice}</p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-foreground/70">Subtotal</p>
                  <p>{planPrice}</p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-foreground/70">Tax</p>
                  <p>$0.00</p>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <p className="text-xl font-bold">Total</p>
                  <p className="text-xl font-bold text-[#088395]">{planPrice}</p>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700 font-semibold mb-2">
                  14-Day Free Trial Included
                </p>
                <p className="text-xs text-[#088395]">
                  You won't be charged until your trial ends. Cancel anytime.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="font-semibold mb-4">What's Included:</h3>
              <ul className="space-y-3">
                {[
                  'Unlimited resume creation',
                  'AI-powered content optimization',
                  'Resume strength analyzer',
                  'Job recommendations',
                  'Cover letter builder',
                  'Priority support'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-[#088395]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-[#088395]" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
