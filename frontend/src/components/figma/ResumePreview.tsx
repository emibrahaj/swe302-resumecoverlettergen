"use client";

import { TEMPLATES } from '@/src/config/templates.config';

export interface CVData {
  personalInfo: {
    fullName: string; email: string; phone: string;
    location: string; title: string; summary: string;
  };
  cvPhoto: string | null;
  workExperience: { id: string; title: string; company: string; location: string; startDate: string; endDate: string; description: string; }[];
  education: { id: string; degree: string; school: string; year: string; }[];
  skills: string[];
  projects: { id: string; name: string; startDate: string; endDate: string; description: string; }[];
  customSections: { id: string; title: string; items: string[]; }[];
  sectionOrder: string[];
  accentColor: string;
  fontFamily: string;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function label(id: string, custom: CVData['customSections']) {
  const map: Record<string, string> = { experience: 'Work Experience', education: 'Education', skills: 'Skills', projects: 'Projects' };
  return map[id] ?? custom.find(s => s.id === id)?.title ?? '';
}

function hasContent(id: string, d: CVData) {
  if (id === 'experience') return d.workExperience.length > 0;
  if (id === 'education')  return d.education.length > 0;
  if (id === 'skills')     return d.skills.length > 0;
  if (id === 'projects')   return d.projects.length > 0;
  return d.customSections.find(s => s.id === id)?.items.some(i => i.trim()) ?? false;
}

function SectionBody({ id, d, accent }: { id: string; d: CVData; accent: string }) {
  if (id === 'experience') return (
    <>{d.workExperience.map(e => (
      <div key={e.id} className="mb-2">
        <p className="font-semibold text-xs">{e.title || 'Job Title'}</p>
        <p className="text-xs text-gray-500">{[e.company, e.startDate && `${e.startDate}–${e.endDate}`].filter(Boolean).join(' · ')}</p>
        {e.description && <p className="text-xs text-gray-600 mt-0.5">{e.description}</p>}
      </div>
    ))}</>
  );
  if (id === 'education') return (
    <>{d.education.map(e => (
      <div key={e.id} className="mb-1.5">
        <p className="font-semibold text-xs">{e.degree || 'Degree'}</p>
        <p className="text-xs text-gray-500">{[e.school, e.year].filter(Boolean).join(' · ')}</p>
      </div>
    ))}</>
  );
  if (id === 'skills') return (
    <div className="flex flex-wrap gap-1">
      {d.skills.map((s, i) => (
        <span key={i} className="px-1.5 py-0.5 text-xs rounded" style={{ background: accent + '22', color: accent }}>{s}</span>
      ))}
    </div>
  );
  if (id === 'projects') return (
    <>{d.projects.map(p => (
      <div key={p.id} className="mb-2">
        <p className="font-semibold text-xs">{p.name || 'Project'}</p>
        <p className="text-xs text-gray-500">{[p.startDate, p.endDate].filter(Boolean).join('–')}</p>
        {p.description && <p className="text-xs text-gray-600 mt-0.5">{p.description}</p>}
      </div>
    ))}</>
  );
  const cs = d.customSections.find(s => s.id === id);
  if (!cs) return null;
  return <ul>{cs.items.filter(i => i.trim()).map((item, i) => <li key={i} className="text-xs text-gray-600">• {item}</li>)}</ul>;
}

// ─── Template 1: Modern Minimal ───────────────────────────────────────────────
function T1({ d }: { d: CVData }) {
  const { personalInfo: p, cvPhoto, sectionOrder, accentColor: a, fontFamily, customSections: cs } = d;
  return (
    <div style={{ fontFamily }} className="text-gray-800 space-y-3">
      <div className="flex gap-3 items-start">
        {cvPhoto && <img src={cvPhoto} className="w-14 h-14 rounded object-cover border-2 flex-shrink-0" style={{ borderColor: a }} />}
        <div>
          <h1 className="text-xl font-bold leading-tight" style={{ color: a }}>{p.fullName || 'Your Name'}</h1>
          <p className="text-xs text-gray-500">{p.title || 'Professional Title'}</p>
          <p className="text-xs text-gray-400 mt-0.5">{[p.email, p.phone, p.location].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      {p.summary && <p className="text-xs text-gray-600 border-l-2 pl-2" style={{ borderColor: a }}>{p.summary}</p>}
      {sectionOrder.filter(id => hasContent(id, d)).map(id => (
        <div key={id}>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-1 pb-0.5 border-b" style={{ color: a, borderColor: a }}>{label(id, cs)}</h2>
          <SectionBody id={id} d={d} accent={a} />
        </div>
      ))}
    </div>
  );
}

// ─── Template 2: Professional Classic ────────────────────────────────────────
function T2({ d }: { d: CVData }) {
  const { personalInfo: p, cvPhoto, sectionOrder, accentColor: a, fontFamily, customSections: cs } = d;
  return (
    <div style={{ fontFamily }} className="text-gray-800">
      <div className="px-4 py-3 text-white flex gap-3 items-center mb-3 rounded" style={{ backgroundColor: a }}>
        {cvPhoto && <img src={cvPhoto} className="w-12 h-12 rounded-full object-cover border-2 border-white flex-shrink-0" />}
        <div>
          <h1 className="text-lg font-bold">{p.fullName || 'Your Name'}</h1>
          <p className="text-xs opacity-80">{p.title || 'Professional Title'}</p>
          <p className="text-xs opacity-60 mt-0.5">{[p.email, p.phone, p.location].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      {p.summary && <p className="text-xs text-gray-600 mb-2 italic px-1">{p.summary}</p>}
      <div className="space-y-2">
        {sectionOrder.filter(id => hasContent(id, d)).map(id => (
          <div key={id}>
            <h2 className="text-xs font-bold uppercase mb-0.5" style={{ color: a }}>{label(id, cs)}</h2>
            <hr className="mb-1.5" style={{ borderColor: a + '44' }} />
            <SectionBody id={id} d={d} accent={a} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Template 3: Creative Bold (teal sidebar) ─────────────────────────────────
function T3({ d }: { d: CVData }) {
  const { personalInfo: p, cvPhoto, sectionOrder, accentColor: a, fontFamily, customSections: cs } = d;
  const sideIds = sectionOrder.filter(id => id === 'skills' || cs.some(s => s.id === id));
  const mainIds = sectionOrder.filter(id => !sideIds.includes(id));
  return (
    <div style={{ fontFamily }} className="flex gap-0 text-gray-800 min-h-full rounded overflow-hidden">
      <div className="w-2/5 p-3 space-y-2 text-white" style={{ backgroundColor: a }}>
        {cvPhoto
          ? <img src={cvPhoto} className="w-full aspect-square object-cover rounded mb-2 border-2 border-white/40" />
          : <div className="w-12 h-12 rounded-full bg-white/20 mx-auto mb-2" />}
        <h1 className="text-sm font-bold">{p.fullName || 'Your Name'}</h1>
        <p className="text-xs opacity-80">{p.title}</p>
        <div className="text-xs opacity-70 space-y-0.5">
          {p.email && <p>✉ {p.email}</p>}
          {p.phone && <p>✆ {p.phone}</p>}
          {p.location && <p>⌖ {p.location}</p>}
        </div>
        {sideIds.filter(id => hasContent(id, d)).map(id => (
          <div key={id}>
            <h2 className="text-xs font-bold uppercase opacity-60 mb-0.5">{label(id, cs)}</h2>
            <div className="text-white">
              {id === 'skills'
                ? <div className="flex flex-wrap gap-1">{d.skills.map((s,i) => <span key={i} className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{s}</span>)}</div>
                : <SectionBody id={id} d={d} accent="#ffffff" />}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 p-3 space-y-2">
        {p.summary && <p className="text-xs text-gray-500 italic mb-1">{p.summary}</p>}
        {mainIds.filter(id => hasContent(id, d)).map(id => (
          <div key={id}>
            <h2 className="text-xs font-bold border-b-2 pb-0.5 mb-1" style={{ color: a, borderColor: a }}>{label(id, cs)}</h2>
            <SectionBody id={id} d={d} accent={a} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Template 4: Executive Elite (dark navy sidebar) ─────────────────────────
function T4({ d }: { d: CVData }) {
  const { personalInfo: p, cvPhoto, sectionOrder, accentColor: a, fontFamily, customSections: cs } = d;
  const sideIds = sectionOrder.filter(id => id === 'skills' || id === 'education' || cs.some(s => s.id === id));
  const mainIds = sectionOrder.filter(id => !sideIds.includes(id));
  return (
    <div style={{ fontFamily }} className="flex min-h-full rounded overflow-hidden text-sm">
      <div className="w-2/5 bg-gray-900 text-white p-3 space-y-2">
        {cvPhoto
          ? <img src={cvPhoto} className="w-14 h-14 rounded object-cover border-2 mx-auto mb-2" style={{ borderColor: a }} />
          : <div className="w-14 h-14 rounded bg-gray-700 mx-auto mb-2" />}
        <h1 className="text-sm font-bold text-center">{p.fullName || 'Your Name'}</h1>
        <p className="text-xs text-gray-400 text-center">{p.title}</p>
        <div className="border-t border-gray-700 pt-2 text-xs text-gray-400 space-y-0.5">
          {p.email && <p className="truncate">{p.email}</p>}
          {p.phone && <p>{p.phone}</p>}
          {p.location && <p>{p.location}</p>}
        </div>
        {sideIds.filter(id => hasContent(id, d)).map(id => (
          <div key={id}>
            <h2 className="text-xs font-bold uppercase mb-1" style={{ color: a }}>{label(id, cs)}</h2>
            {id === 'skills'
              ? <div className="flex flex-wrap gap-1">{d.skills.map((s,i) => <span key={i} className="text-xs px-1.5 py-0.5 rounded border border-gray-600 text-gray-300">{s}</span>)}</div>
              : <SectionBody id={id} d={d} accent={a} />}
          </div>
        ))}
      </div>
      <div className="flex-1 p-3 space-y-2">
        {p.summary && <p className="text-xs text-gray-600 mb-1">{p.summary}</p>}
        {mainIds.filter(id => hasContent(id, d)).map(id => (
          <div key={id}>
            <h2 className="text-xs font-bold border-b pb-0.5 mb-1 text-gray-800" style={{ borderColor: a }}>{label(id, cs)}</h2>
            <SectionBody id={id} d={d} accent={a} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Template 5: Tech Innovator (dark header, code aesthetic) ────────────────
function T5({ d }: { d: CVData }) {
  const { personalInfo: p, cvPhoto, sectionOrder, accentColor: a, fontFamily, customSections: cs } = d;
  return (
    <div style={{ fontFamily }} className="text-gray-800 min-h-full rounded overflow-hidden">
      <div className="bg-gray-900 px-4 py-3 text-white">
        <div className="flex items-center gap-1.5 mb-2">
          {['bg-red-400','bg-yellow-400','bg-green-400'].map(c => <div key={c} className={`w-2 h-2 rounded-full ${c}`} />)}
        </div>
        <div className="flex gap-3 items-start">
          {cvPhoto && <img src={cvPhoto} className="w-12 h-12 rounded object-cover flex-shrink-0 border" style={{ borderColor: a }} />}
          <div>
            <h1 className="text-base font-bold" style={{ color: a }}>{p.fullName || 'Your Name'}</h1>
            <p className="text-xs text-gray-400">{p.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{[p.email, p.location].filter(Boolean).join(' | ')}</p>
          </div>
        </div>
      </div>
      <div className="p-3 space-y-2.5">
        {p.summary && <p className="text-xs text-gray-600 font-mono border-l-2 pl-2" style={{ borderColor: a }}>{p.summary}</p>}
        {sectionOrder.filter(id => hasContent(id, d)).map(id => (
          <div key={id}>
            <h2 className="text-xs font-bold font-mono uppercase mb-1" style={{ color: a }}>{'// '}{label(id, cs)}</h2>
            {id === 'skills'
              ? <div className="flex flex-wrap gap-1">{d.skills.map((s,i) => <span key={i} className="text-xs border rounded px-1.5 py-0.5 font-mono" style={{ borderColor: a + '60', color: a }}>{s}</span>)}</div>
              : <SectionBody id={id} d={d} accent={a} />}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Template 6: Designer Portfolio (left accent strip) ──────────────────────
function T6({ d }: { d: CVData }) {
  const { personalInfo: p, cvPhoto, sectionOrder, accentColor: a, fontFamily, customSections: cs } = d;
  return (
    <div style={{ fontFamily }} className="text-gray-800 min-h-full flex rounded overflow-hidden">
      <div className="w-1.5 flex-shrink-0" style={{ background: `linear-gradient(to bottom, ${a}, #8b5cf6)` }} />
      <div className="flex-1 p-4 space-y-3">
        <div className="flex items-center gap-3">
          {cvPhoto
            ? <img src={cvPhoto} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
            : <div className="w-14 h-14 rounded-lg flex-shrink-0" style={{ background: `linear-gradient(135deg, ${a}, #8b5cf6)` }} />}
          <div>
            <h1 className="text-lg font-black tracking-tight">{p.fullName || 'Your Name'}</h1>
            <p className="text-xs font-medium" style={{ color: a }}>{p.title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{[p.email, p.phone].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
        {p.summary && <p className="text-xs text-gray-500">{p.summary}</p>}
        {sectionOrder.filter(id => hasContent(id, d)).map(id => (
          <div key={id}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: a }} />
              <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: a }}>{label(id, cs)}</h2>
            </div>
            <SectionBody id={id} d={d} accent={a} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Template 7: Academic Scholar (centered, traditional) ────────────────────
function T7({ d }: { d: CVData }) {
  const { personalInfo: p, cvPhoto, sectionOrder, accentColor: a, fontFamily, customSections: cs } = d;
  return (
    <div style={{ fontFamily }} className="text-gray-800 space-y-2.5">
      <div className="text-center border-b-2 border-gray-800 pb-2">
        {cvPhoto && <img src={cvPhoto} className="w-12 h-12 rounded-full object-cover mx-auto mb-1 border-2" style={{ borderColor: a }} />}
        <h1 className="text-lg font-bold text-gray-900">{p.fullName || 'Your Name'}</h1>
        <p className="text-xs text-gray-500">{p.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{[p.email, p.phone, p.location].filter(Boolean).join(' · ')}</p>
      </div>
      {p.summary && <p className="text-xs text-gray-600 text-center italic">{p.summary}</p>}
      {sectionOrder.filter(id => hasContent(id, d)).map(id => (
        <div key={id}>
          <h2 className="text-xs font-bold uppercase text-gray-700 mb-0.5 tracking-wider">{label(id, cs)}</h2>
          <div className="border-b border-gray-400 mb-1.5" />
          <SectionBody id={id} d={d} accent={a} />
        </div>
      ))}
    </div>
  );
}

// ─── Template 8: Startup Founder (gradient header, two-column cards) ─────────
function T8({ d }: { d: CVData }) {
  const { personalInfo: p, cvPhoto, sectionOrder, accentColor: a, fontFamily, customSections: cs } = d;
  const paired = ['experience', 'education'];
  const rest   = sectionOrder.filter(id => !paired.includes(id));
  return (
    <div style={{ fontFamily }} className="text-gray-800 min-h-full rounded overflow-hidden">
      <div className="px-4 py-3 text-white" style={{ background: `linear-gradient(135deg, ${a}, #14b8a6)` }}>
        <div className="flex gap-3 items-center">
          {cvPhoto && <img src={cvPhoto} className="w-12 h-12 rounded-lg object-cover border-2 border-white/50 flex-shrink-0" />}
          <div>
            <h1 className="text-base font-black">{p.fullName || 'Your Name'}</h1>
            <p className="text-xs opacity-80">{p.title}</p>
            <p className="text-xs opacity-60 mt-0.5">{[p.email, p.location].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
      </div>
      <div className="p-3 space-y-2">
        {p.summary && <p className="text-xs text-gray-500">{p.summary}</p>}
        <div className="grid grid-cols-2 gap-2">
          {paired.filter(id => hasContent(id, d)).map(id => (
            <div key={id} className="rounded p-2 space-y-1" style={{ backgroundColor: a + '10' }}>
              <h2 className="text-xs font-bold" style={{ color: a }}>{label(id, cs)}</h2>
              <SectionBody id={id} d={d} accent={a} />
            </div>
          ))}
        </div>
        {rest.filter(id => hasContent(id, d)).map(id => (
          <div key={id}>
            <h2 className="text-xs font-bold mb-0.5" style={{ color: a }}>{label(id, cs)}</h2>
            <SectionBody id={id} d={d} accent={a} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Template 9: Minimalist Pro (ultra clean, black only) ────────────────────
function T9({ d }: { d: CVData }) {
  const { personalInfo: p, cvPhoto, sectionOrder, fontFamily, customSections: cs } = d;
  return (
    <div style={{ fontFamily }} className="text-gray-900 space-y-3 p-2">
      <div className="flex gap-3 items-start">
        {cvPhoto && <img src={cvPhoto} className="w-12 h-12 object-cover flex-shrink-0 grayscale" />}
        <div>
          <h1 className="text-xl font-black tracking-tighter">{p.fullName || 'Your Name'}</h1>
          <p className="text-xs text-gray-400 uppercase tracking-widest">{p.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{[p.email, p.phone, p.location].filter(Boolean).join('  ·  ')}</p>
        </div>
      </div>
      {p.summary && <p className="text-xs text-gray-500">{p.summary}</p>}
      {sectionOrder.filter(id => hasContent(id, d)).map(id => (
        <div key={id} className="border-t border-gray-200 pt-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{label(id, cs)}</h2>
          <SectionBody id={id} d={d} accent="#111827" />
        </div>
      ))}
    </div>
  );
}

// ─── Template 10: Bold Statement (dark bg, high contrast) ────────────────────
function T10({ d }: { d: CVData }) {
  const { personalInfo: p, cvPhoto, sectionOrder, accentColor: a, fontFamily, customSections: cs } = d;
  return (
    <div style={{ fontFamily, backgroundColor: '#111827' }} className="text-white min-h-full rounded overflow-hidden p-4 space-y-3">
      <div className="flex gap-3 items-start">
        {cvPhoto && <img src={cvPhoto} className="w-14 h-14 rounded object-cover border-2 flex-shrink-0" style={{ borderColor: a }} />}
        <div>
          <h1 className="text-xl font-black leading-tight" style={{ color: a }}>{p.fullName || 'Your Name'}</h1>
          <p className="text-xs text-gray-400 uppercase tracking-wider">{p.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{[p.email, p.phone, p.location].filter(Boolean).join(' · ')}</p>
        </div>
      </div>
      <div className="border-t border-gray-700" />
      {p.summary && <p className="text-xs text-gray-400">{p.summary}</p>}
      {sectionOrder.filter(id => hasContent(id, d)).map(id => (
        <div key={id}>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-1 pb-0.5 border-b border-gray-700" style={{ color: a }}>{label(id, cs)}</h2>
          {id === 'skills'
            ? <div className="flex flex-wrap gap-1">{d.skills.map((s,i) => <span key={i} className="text-xs border rounded px-1.5 py-0.5" style={{ borderColor: a + '60', color: a }}>{s}</span>)}</div>
            : <div className="text-gray-300"><SectionBody id={id} d={d} accent={a} /></div>}
        </div>
      ))}
    </div>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

const TEMPLATE_MAP: Record<string, React.ComponentType<{ d: CVData }>> = {
  '1': T1, '2': T2, '3': T3, '4': T4, '5': T5,
  '6': T6, '7': T7, '8': T8, '9': T9, '10': T10,
};

export const TEMPLATE_NAMES = Object.fromEntries(TEMPLATES.map(t => [t.id, t.name]));

export function ResumePreview({ templateId, data }: { templateId: string; data: CVData }) {
  const Preview = TEMPLATE_MAP[templateId] ?? T1;
  return <Preview d={data} />;
}
