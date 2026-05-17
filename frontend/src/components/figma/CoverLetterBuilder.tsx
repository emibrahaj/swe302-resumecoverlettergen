"use client";

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Crown, Download, Eye, Save, Sparkles} from 'lucide-react';
import {toast} from 'sonner';
import {api, ApiError} from '@/src/lib/api';
import {useSubscription} from '@/src/context/SubscriptionContext';
import {useModals} from '@/src/context/ModalContext';

interface LetterData {
    recipientName: string;
    recipientTitle: string;
    companyName: string;
    companyAddress: string;
    position: string;
    yourName: string;
    yourAddress: string;
    yourEmail: string;
    yourPhone: string;
    opening: string;
    body: string;
    closing: string;
}

const INITIAL: LetterData = {
    recipientName: '',
    recipientTitle: '',
    companyName: '',
    companyAddress: '',
    position: '',
    yourName: '',
    yourAddress: '',
    yourEmail: '',
    yourPhone: '',
    opening: '',
    body: '',
    closing: '',
};

// function ProPaywall({ onUpgrade }: { onUpgrade: () => void }) {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center py-16 px-4">
//       <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center">
//         <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center mb-4">
//           <Crown size={28} className="text-white" />
//         </div>
//         <h1 className="text-3xl font-bold mb-2">Cover Letters are a Pro feature</h1>
//         <p className="text-foreground/70 mb-6">
//           Generate compelling, role-specific cover letters with our AI writer in seconds.
//           Upgrade to Pro to unlock this and the full set of premium features.
//         </p>
//         <ul className="text-left space-y-2 mb-6">
//           <li className="flex items-center gap-2 text-sm"><Star size={14} className="text-[#088395]" /> AI-generated cover letters tailored to each job</li>
//           <li className="flex items-center gap-2 text-sm"><Star size={14} className="text-[#088395]" /> Use any of your resumes as context</li>
//           <li className="flex items-center gap-2 text-sm"><Star size={14} className="text-[#088395]" /> Save, edit, and download as PDF</li>
//           <li className="flex items-center gap-2 text-sm"><Star size={14} className="text-[#088395]" /> Skill matrix + job matching + market insights</li>
//         </ul>
//         <button
//           onClick={onUpgrade}
//           className="w-full py-3 bg-[#088395] text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-xl transition-all"
//         >
//           <Crown size={16} className="text-yellow-300" />
//           Upgrade — from €4.99/week
//         </button>
//         <p className="mt-3 text-xs text-foreground/50">Cancel anytime. No hidden fees.</p>
//       </div>
//     </div>
//   );
// }

interface CoverLetterBuilderProps {
    initialId?: string;
}

export function CoverLetterBuilder({initialId}: CoverLetterBuilderProps = {}) {
    const router = useRouter();
    const {isPro, loading: subLoading} = useSubscription();
    const {openLogin} = useModals();

    const [letterData, setLetterData] = useState<LetterData>(INITIAL);
    const [aiEnhancing, setAiEnhancing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [coverLetterId, setCoverLetterId] = useState<string | null>(initialId ?? null);
    const [dataLoading, setDataLoading] = useState(!!initialId);

    // When editing an existing cover letter, fetch it and populate the form
    useEffect(() => {
        if (!initialId) return;
        let cancelled = false;
        (async () => {
            try {
                const cl = await api.get<{
                    id: string;
                    content?: string | null;
                    job_position?: string | null;
                    title?: string | null;
                }>(`/cover-letters/${initialId}`);
                if (cancelled) return;
                setLetterData((prev) => ({
                    ...prev,
                    position: cl.job_position ?? '',
                    body: cl.content ?? '',
                }));
                setCoverLetterId(cl.id);
            } catch {
                toast.error('Could not load cover letter');
            } finally {
                if (!cancelled) setDataLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [initialId]);

    const requireAuth = (): boolean => {
        if (typeof window === 'undefined') return false;
        if (!window.localStorage.getItem('access_token')) {
            toast.info('Please sign in first');
            openLogin();
            return false;
        }
        return true;
    };

    // Wait until we know whether the user is Pro — avoids briefly showing the builder for free users
    if (subLoading || dataLoading) {
        return <div
            className="min-h-screen flex items-center justify-center text-foreground/60">{dataLoading ? 'Loading cover letter…' : 'Checking your subscription…'}</div>;
    }

    const parseGeneratedContent = (raw: string) => {
        // The AI returns markdown text. Try to split it into opening / body / closing on
        // double newlines, and fall back to dumping everything into body.
        const trimmed = (raw || '').trim();
        const blocks = trimmed.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
        if (blocks.length === 0) return;
        if (blocks.length === 1) {
            setLetterData((d) => ({...d, body: blocks[0]}));
            return;
        }
        const first = blocks[0];
        const last = blocks[blocks.length - 1];
        const middle = blocks.slice(1, -1).join('\n\n');
        setLetterData((d) => ({
            ...d,
            opening: first,
            body: middle || first,
            closing: last
        }));
    };

    const handleAiEnhance = async () => {
        if (!requireAuth()) return;
        if (aiEnhancing) return;
        const jobPosition = letterData.position.trim();
        if (!jobPosition) {
            toast.error('Add the position you’re applying for first');
            return;
        }
        setAiEnhancing(true);
        const toastId = toast.loading('Generating a tailored cover letter…');
        try {
            const userInput = [
                letterData.yourName && `My name is ${letterData.yourName}.`,
                letterData.companyName && `I am applying to ${letterData.companyName}.`,
                letterData.opening,
                letterData.body,
            ].filter(Boolean).join(' ');

            const result = await api.post<{
                status: string;
                cover_letter: { id: string; content: string }
            }>(
                '/cover-letters/generate',
                {
                    job_position: jobPosition,
                    user_input: userInput || `Cover letter for ${jobPosition}`,
                    title: `Cover Letter - ${jobPosition}`,
                    type: 'ai_generated',
                },
            );
            const content = result?.cover_letter?.content || '';
            if (!content) throw new Error('AI returned empty content');
            parseGeneratedContent(content);
            setCoverLetterId(result.cover_letter.id);
            toast.success('Cover letter generated ✨', {id: toastId});
        } catch (e) {
            toast.error(e instanceof ApiError ? e.message : (e instanceof Error ? e.message : 'AI generation failed'), {id: toastId});
        } finally {
            setAiEnhancing(false);
        }
    };

    const handleSave = async () => {
        if (!requireAuth()) return;
        if (saving) return;
        setSaving(true);
        const toastId = toast.loading('Saving cover letter…');
        try {
            const content = [letterData.opening, letterData.body, letterData.closing]
                .filter(Boolean)
                .join('\n\n');
            const payload = {
                title: `Cover Letter - ${letterData.position || 'Untitled'}`,
                content,
                type: 'manual' as const,
                job_position: letterData.position || null,
            };

            if (coverLetterId) {
                await api.patch(`/cover-letters/${coverLetterId}`, payload);
            } else {
                const res = await api.post<{
                    id: string
                }>('/cover-letters/', payload);
                setCoverLetterId(res.id);
            }
            toast.success('Cover letter saved', {id: toastId});
        } catch (e) {
            toast.error(e instanceof ApiError ? e.message : 'Save failed', {id: toastId});
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (downloading) return;
        setDownloading(true);
        try {
            // Pure client-side PDF: open the preview in a new window and trigger the browser's print dialog
            const win = window.open('', '_blank', 'width=900,height=1200');
            if (!win) {
                toast.error('Popup blocked — allow popups for localhost and try again');
                return;
            }
            const date = new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${letterData.position || 'Cover Letter'}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; padding: 56px 64px; line-height: 1.55; color: #111827; max-width: 720px; margin: 0 auto; }
  .right { text-align: right; }
  p { margin: 0 0 12px; white-space: pre-wrap; }
  .group { margin-bottom: 18px; }
</style></head>
<body>
  ${letterData.yourName ? `<div class="right group">
    <p><strong>${letterData.yourName}</strong></p>
    ${letterData.yourAddress ? `<p>${letterData.yourAddress}</p>` : ''}
    ${letterData.yourEmail ? `<p>${letterData.yourEmail}</p>` : ''}
    ${letterData.yourPhone ? `<p>${letterData.yourPhone}</p>` : ''}
  </div>` : ''}
  <div class="group"><p>${date}</p></div>
  ${(letterData.recipientName || letterData.companyName) ? `<div class="group">
    ${letterData.recipientName ? `<p>${letterData.recipientName}</p>` : ''}
    ${letterData.recipientTitle ? `<p>${letterData.recipientTitle}</p>` : ''}
    ${letterData.companyName ? `<p>${letterData.companyName}</p>` : ''}
    ${letterData.companyAddress ? `<p>${letterData.companyAddress}</p>` : ''}
  </div>` : ''}
  ${letterData.opening ? `<div class="group"><p>${letterData.opening}</p></div>` : ''}
  ${letterData.body ? `<div class="group"><p>${letterData.body}</p></div>` : ''}
  ${letterData.closing ? `<div class="group"><p>${letterData.closing}</p></div>` : ''}
  <script>setTimeout(() => { window.focus(); window.print(); }, 250);</script>
</body></html>`;
            win.document.open();
            win.document.write(html);
            win.document.close();
            toast.success('Print dialog opened — choose “Save as PDF”');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div
                className="bg-gradient-to-r from-[#088395] to-teal-600 px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-7xl mx-auto">

                    <div
                        className="flex items-start justify-between mb-4 flex-wrap gap-3">

                        {/* LEFT: Title */}
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                                {coverLetterId && initialId ? 'Edit Cover Letter' : 'Create Cover Letter'}
                                <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs font-bold">
                    <Crown size={10}/>
                    PRO
                  </span>
                            </h1>
                            <p className="text-white/90">
                                Craft a compelling cover letter to
                                accompany your resume
                            </p>
                        </div>

                        {/* RIGHT: Buttons */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={handleAiEnhance}
                                className={`flex items-center gap-2 px-4 py-2 bg-white text-[#088395] rounded-lg hover:shadow-lg transition-all ${
                                    aiEnhancing ? 'opacity-75 cursor-wait' : ''
                                }`}
                                disabled={aiEnhancing}
                            >
                                <Sparkles size={16}
                                          className={aiEnhancing ? 'animate-spin' : ''}/>
                                {aiEnhancing ? 'Generating…' : 'Extend with AI'}
                            </button>

                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className={`flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all ${
                                    saving ? 'opacity-75 cursor-wait' : ''
                                }`}
                            >
                                <Save size={16}
                                      className={saving ? 'animate-pulse' : ''}/>
                                {saving ? 'Saving…' : 'Save'}
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadPdf}
                                disabled={downloading}
                                className={`flex items-center gap-2 px-4 py-2 bg-white text-[#088395] rounded-lg hover:shadow-lg transition-all ${
                                    downloading ? 'opacity-75 cursor-wait' : ''
                                }`}
                            >
                                <Download size={16}/>
                                Download PDF
                            </button>
                        </div>

                    </div>

                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold mb-4">Your
                                Information</h3>
                            <div className="space-y-4">
                                <input type="text"
                                       placeholder="Your Full Name"
                                       value={letterData.yourName}
                                       onChange={(e) => setLetterData({
                                           ...letterData,
                                           yourName: e.target.value
                                       })}
                                       className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"/>
                                <input type="text"
                                       placeholder="Your Address"
                                       value={letterData.yourAddress}
                                       onChange={(e) => setLetterData({
                                           ...letterData,
                                           yourAddress: e.target.value
                                       })}
                                       className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"/>
                                <input type="email"
                                       placeholder="Your Email"
                                       value={letterData.yourEmail}
                                       onChange={(e) => setLetterData({
                                           ...letterData,
                                           yourEmail: e.target.value
                                       })}
                                       className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"/>
                                <input type="tel" placeholder="Your Phone"
                                       value={letterData.yourPhone}
                                       onChange={(e) => setLetterData({
                                           ...letterData,
                                           yourPhone: e.target.value
                                       })}
                                       className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"/>
                            </div>
                        </div>

                        <div
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold mb-4">Recipient
                                Information</h3>
                            <div className="space-y-4">
                                <input type="text"
                                       placeholder="Recipient Name"
                                       value={letterData.recipientName}
                                       onChange={(e) => setLetterData({
                                           ...letterData,
                                           recipientName: e.target.value
                                       })}
                                       className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"/>
                                <input type="text"
                                       placeholder="Recipient Title (e.g., Hiring Manager)"
                                       value={letterData.recipientTitle}
                                       onChange={(e) => setLetterData({
                                           ...letterData,
                                           recipientTitle: e.target.value
                                       })}
                                       className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"/>
                                <input type="text"
                                       placeholder="Company Name"
                                       value={letterData.companyName}
                                       onChange={(e) => setLetterData({
                                           ...letterData,
                                           companyName: e.target.value
                                       })}
                                       className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"/>
                                <input type="text"
                                       placeholder="Company Address"
                                       value={letterData.companyAddress}
                                       onChange={(e) => setLetterData({
                                           ...letterData,
                                           companyAddress: e.target.value
                                       })}
                                       className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"/>
                                <input type="text"
                                       placeholder="Position Applying For (required for AI)"
                                       value={letterData.position}
                                       onChange={(e) => setLetterData({
                                           ...letterData,
                                           position: e.target.value
                                       })}
                                       className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none"/>
                            </div>
                        </div>

                        <div
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-semibold mb-4">Letter
                                Content</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block mb-2 text-sm">Opening
                                        Paragraph</label>
                                    <textarea
                                        placeholder="Introduce yourself and state the position you're applying for…"
                                        value={letterData.opening}
                                        onChange={(e) => setLetterData({
                                            ...letterData,
                                            opening: e.target.value
                                        })} rows={4}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"/>
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm">Body
                                        Paragraphs</label>
                                    <textarea
                                        placeholder="Highlight your relevant experience, skills, and why you're a great fit…"
                                        value={letterData.body}
                                        onChange={(e) => setLetterData({
                                            ...letterData,
                                            body: e.target.value
                                        })} rows={8}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"/>
                                </div>

                                <div>
                                    <label className="block mb-2 text-sm">Closing
                                        Paragraph</label>
                                    <textarea
                                        placeholder="Express your enthusiasm and request an interview…"
                                        value={letterData.closing}
                                        onChange={(e) => setLetterData({
                                            ...letterData,
                                            closing: e.target.value
                                        })} rows={4}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-[#088395] focus:outline-none resize-none"/>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="lg:sticky lg:top-24 h-fit">
                        <div
                            className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                            <div
                                className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Eye size={20}/>
                                    Live Preview
                                </h3>
                            </div>

                            <div
                                className="aspect-[8.5/11] bg-white shadow-2xl rounded-lg p-12 overflow-auto border border-gray-200 text-sm">
                                <div className="space-y-4">
                                    {letterData.yourName && (
                                        <div className="text-right">
                                            <p className="font-semibold">{letterData.yourName}</p>
                                            {letterData.yourAddress &&
                                                <p>{letterData.yourAddress}</p>}
                                            {letterData.yourEmail &&
                                                <p>{letterData.yourEmail}</p>}
                                            {letterData.yourPhone &&
                                                <p>{letterData.yourPhone}</p>}
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        <p>{new Date().toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    </div>

                                    {(letterData.recipientName || letterData.companyName) && (
                                        <div className="pt-4">
                                            {letterData.recipientName &&
                                                <p>{letterData.recipientName}</p>}
                                            {letterData.recipientTitle &&
                                                <p>{letterData.recipientTitle}</p>}
                                            {letterData.companyName &&
                                                <p>{letterData.companyName}</p>}
                                            {letterData.companyAddress &&
                                                <p>{letterData.companyAddress}</p>}
                                        </div>
                                    )}

                                    {letterData.opening && (
                                        <div className="pt-2">
                                            <p className="whitespace-pre-wrap">{letterData.opening}</p>
                                        </div>
                                    )}

                                    {letterData.body && (
                                        <div className="pt-2">
                                            <p className="whitespace-pre-wrap">{letterData.body}</p>
                                        </div>
                                    )}

                                    {letterData.closing && (
                                        <div className="pt-2">
                                            <p className="whitespace-pre-wrap">{letterData.closing}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}