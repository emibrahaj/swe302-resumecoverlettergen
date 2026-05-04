"use client";
import { useState } from 'react';
import { ArrowLeft, Sparkles, Download, Save, Eye } from 'lucide-react';

export function CoverLetterBuilder() {
  const [letterData, setLetterData] = useState({
    recipientName: '',
    recipientTitle: '',
    companyName: '',
    companyAddress: '',
    position: '',
    yourName: '',
    yourAddress: '',
    yourEmail: '',
    yourPhone: '',
    greeting: 'Dear Hiring Manager,',
    opening: '',
    body: '',
    closing: '',
    signature: 'Sincerely,'
  });

  const [aiEnhancing, setAiEnhancing] = useState(false);

  const handleAiEnhance = () => {
    setAiEnhancing(true);
    setTimeout(() => {
      setAiEnhancing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <div className="flex items-center gap-4">
              <button
                onClick={handleAiEnhance}
                className={`flex items-center gap-2 px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg transition-all ${
                  aiEnhancing ? 'opacity-75' : ''
                }`}
                disabled={aiEnhancing}
              >
                <Sparkles size={16} className={aiEnhancing ? 'animate-spin' : ''} />
                {aiEnhancing ? 'Enhancing...' : 'AI Enhance'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50">
                <Save size={16} />
                Save
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#088395] text-white rounded-lg hover:shadow-lg">
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create Cover Letter</h1>
          <p className="text-foreground/70">Craft a compelling cover letter to accompany your resume</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Your Information</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Full Name"
                  value={letterData.yourName}
                  onChange={(e) => setLetterData({ ...letterData, yourName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Your Address"
                  value={letterData.yourAddress}
                  onChange={(e) => setLetterData({ ...letterData, yourAddress: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={letterData.yourEmail}
                  onChange={(e) => setLetterData({ ...letterData, yourEmail: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Your Phone"
                  value={letterData.yourPhone}
                  onChange={(e) => setLetterData({ ...letterData, yourPhone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Recipient Information</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Recipient Name"
                  value={letterData.recipientName}
                  onChange={(e) => setLetterData({ ...letterData, recipientName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Recipient Title (e.g., Hiring Manager)"
                  value={letterData.recipientTitle}
                  onChange={(e) => setLetterData({ ...letterData, recipientTitle: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Company Name"
                  value={letterData.companyName}
                  onChange={(e) => setLetterData({ ...letterData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Company Address"
                  value={letterData.companyAddress}
                  onChange={(e) => setLetterData({ ...letterData, companyAddress: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Position Applying For"
                  value={letterData.position}
                  onChange={(e) => setLetterData({ ...letterData, position: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Letter Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm">Greeting</label>
                  <input
                    type="text"
                    value={letterData.greeting}
                    onChange={(e) => setLetterData({ ...letterData, greeting: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">Opening Paragraph</label>
                  <textarea
                    placeholder="Introduce yourself and state the position you're applying for..."
                    value={letterData.opening}
                    onChange={(e) => setLetterData({ ...letterData, opening: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">Body Paragraphs</label>
                  <textarea
                    placeholder="Highlight your relevant experience, skills, and why you're a great fit..."
                    value={letterData.body}
                    onChange={(e) => setLetterData({ ...letterData, body: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">Closing Paragraph</label>
                  <textarea
                    placeholder="Express your enthusiasm and request an interview..."
                    value={letterData.closing}
                    onChange={(e) => setLetterData({ ...letterData, closing: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm">Signature</label>
                  <input
                    type="text"
                    value={letterData.signature}
                    onChange={(e) => setLetterData({ ...letterData, signature: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Eye size={20} />
                  Live Preview
                </h3>
              </div>

              <div className="aspect-[8.5/11] bg-white shadow-2xl rounded-lg p-12 overflow-auto border border-gray-200 text-sm">
                <div className="space-y-4">
                  {/* Your Info */}
                  {letterData.yourName && (
                    <div className="text-right">
                      <p className="font-semibold">{letterData.yourName}</p>
                      {letterData.yourAddress && <p>{letterData.yourAddress}</p>}
                      {letterData.yourEmail && <p>{letterData.yourEmail}</p>}
                      {letterData.yourPhone && <p>{letterData.yourPhone}</p>}
                    </div>
                  )}

                  <div className="pt-4">
                    <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>

                  {/* Recipient Info */}
                  {(letterData.recipientName || letterData.companyName) && (
                    <div className="pt-4">
                      {letterData.recipientName && <p>{letterData.recipientName}</p>}
                      {letterData.recipientTitle && <p>{letterData.recipientTitle}</p>}
                      {letterData.companyName && <p>{letterData.companyName}</p>}
                      {letterData.companyAddress && <p>{letterData.companyAddress}</p>}
                    </div>
                  )}

                  {/* Greeting */}
                  <div className="pt-4">
                    <p>{letterData.greeting}</p>
                  </div>

                  {/* Opening */}
                  {letterData.opening && (
                    <div className="pt-2">
                      <p className="whitespace-pre-wrap">{letterData.opening}</p>
                    </div>
                  )}

                  {/* Body */}
                  {letterData.body && (
                    <div className="pt-2">
                      <p className="whitespace-pre-wrap">{letterData.body}</p>
                    </div>
                  )}

                  {/* Closing */}
                  {letterData.closing && (
                    <div className="pt-2">
                      <p className="whitespace-pre-wrap">{letterData.closing}</p>
                    </div>
                  )}

                  {/* Signature */}
                  <div className="pt-4">
                    <p>{letterData.signature}</p>
                    {letterData.yourName && <p className="pt-8">{letterData.yourName}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
