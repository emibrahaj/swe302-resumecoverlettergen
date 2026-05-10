/**
 * TemplateSkeleton
 *
 * Shared skeleton preview for each template ID.
 * Used by TemplateShowcase (homepage), TemplateGallery (showcase page),
 * and TemplatesShowcase (all-templates page) so all three stay in sync.
 *
 * To add a new template: add a new case to the skeletons map below.
 */
export function TemplateSkeleton({ id }: { id: string }) {
  const skeletons: Record<string, React.ReactElement> = {
    "1": ( // Modern Minimal — single column, teal accents
      <div className="h-full bg-white rounded shadow-sm p-3 space-y-2">
        <div className="h-2.5 bg-[#088395] rounded w-3/4" />
        <div className="h-1.5 bg-gray-300 rounded w-1/2" />
        <div className="h-px bg-[#088395]/30 w-full my-1" />
        <div className="space-y-1"><div className="h-1.5 bg-gray-200 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-5/6" /><div className="h-1.5 bg-gray-200 rounded w-4/6" /></div>
        <div className="h-1.5 bg-[#088395] rounded w-2/5 mt-2" />
        <div className="space-y-1"><div className="h-1.5 bg-gray-200 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-3/4" /></div>
        <div className="h-1.5 bg-[#088395] rounded w-2/5 mt-2" />
        <div className="flex flex-wrap gap-1">{[10,14,10,12].map((w,i)=><div key={i} className="h-2 rounded-full bg-[#088395]/20" style={{width:`${w*3}px`}}/>)}</div>
      </div>
    ),
    "2": ( // Professional Classic — solid teal header bar
      <div className="h-full bg-white rounded shadow-sm overflow-hidden">
        <div className="bg-[#088395] px-3 py-2.5"><div className="h-2.5 bg-white/90 rounded w-3/4 mb-1" /><div className="h-1.5 bg-white/60 rounded w-1/2" /></div>
        <div className="p-3 space-y-2.5">
          <div><div className="h-1.5 bg-[#088395]/60 rounded w-2/5 mb-1" /><div className="h-px bg-[#088395]/20 w-full mb-1" /><div className="h-1.5 bg-gray-200 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-5/6" /></div>
          <div><div className="h-1.5 bg-[#088395]/60 rounded w-2/5 mb-1" /><div className="h-px bg-[#088395]/20 w-full mb-1" /><div className="h-1.5 bg-gray-200 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-3/4" /></div>
          <div><div className="h-1.5 bg-[#088395]/60 rounded w-1/3 mb-1" /><div className="h-px bg-[#088395]/20 w-full mb-1" /><div className="flex gap-1">{[3,4,3,5].map((w,i)=><div key={i} className="h-2 bg-gray-200 rounded-full" style={{width:`${w*10}px`}}/>)}</div></div>
        </div>
      </div>
    ),
    "3": ( // Creative Bold — teal sidebar
      <div className="h-full bg-white rounded shadow-sm overflow-hidden flex">
        <div className="w-2/5 bg-[#088395] p-2 space-y-2">
          <div className="w-8 h-8 rounded-full bg-white/30 mx-auto mb-2" />
          <div className="h-2 bg-white/80 rounded w-4/5" /><div className="h-1.5 bg-white/50 rounded w-3/5" />
          <div className="mt-2 space-y-1"><div className="h-1 bg-white/40 rounded w-3/4" /><div className="h-1.5 bg-white/60 rounded w-2/3" /><div className="h-1.5 bg-white/60 rounded w-4/5" /><div className="h-1.5 bg-white/60 rounded w-3/5" /></div>
        </div>
        <div className="flex-1 p-2 space-y-2">
          <div className="h-1.5 bg-[#088395] rounded w-3/4" /><div className="h-px bg-gray-200 w-full" />
          <div className="space-y-1"><div className="h-1.5 bg-gray-300 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-5/6" /><div className="h-1.5 bg-gray-200 rounded w-4/6" /></div>
          <div className="h-1.5 bg-[#088395] rounded w-2/3" /><div className="h-px bg-gray-200 w-full" />
          <div className="space-y-1"><div className="h-1.5 bg-gray-300 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-5/6" /></div>
        </div>
      </div>
    ),
    "4": ( // Executive Elite — dark navy sidebar
      <div className="h-full bg-white rounded shadow-sm overflow-hidden flex">
        <div className="w-2/5 bg-gray-800 p-2 space-y-2">
          <div className="w-10 h-10 rounded bg-gray-600 mx-auto mb-1" />
          <div className="h-2 bg-white/80 rounded w-4/5 mx-auto" /><div className="h-1 bg-white/40 rounded w-3/5 mx-auto" />
          <div className="h-px bg-white/20 w-full mt-1" />
          <div className="space-y-1"><div className="h-1 bg-[#088395]/70 rounded w-3/5" /><div className="h-1.5 bg-white/50 rounded w-full" /><div className="h-1.5 bg-white/50 rounded w-4/5" /><div className="h-1 bg-[#088395]/70 rounded w-3/5 mt-1" /><div className="h-1.5 bg-white/50 rounded w-full" /></div>
        </div>
        <div className="flex-1 p-2 space-y-2">
          <div className="h-1.5 bg-gray-800 rounded w-3/4" /><div className="h-px bg-gray-300 w-full" />
          <div className="space-y-1"><div className="h-1.5 bg-gray-200 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-5/6" /><div className="h-1.5 bg-gray-200 rounded w-4/6" /></div>
          <div className="h-1.5 bg-gray-800 rounded w-2/3 mt-1" /><div className="h-px bg-gray-300 w-full" />
          <div className="space-y-1"><div className="h-1.5 bg-gray-200 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-3/4" /></div>
        </div>
      </div>
    ),
    "5": ( // Tech Innovator — dark header, monospace chips
      <div className="h-full bg-white rounded shadow-sm overflow-hidden">
        <div className="bg-gray-900 px-3 py-2">
          <div className="flex items-center gap-1 mb-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-400" /><div className="w-1.5 h-1.5 rounded-full bg-yellow-400" /><div className="w-1.5 h-1.5 rounded-full bg-green-400" /></div>
          <div className="h-2 bg-[#088395] rounded w-3/4 mb-1" /><div className="h-1.5 bg-white/40 rounded w-1/2" />
        </div>
        <div className="p-3 space-y-2">
          <div><div className="h-1.5 bg-[#088395]/60 rounded w-2/5 mb-1" /><div className="flex gap-1 flex-wrap">{[4,3,5,4,3].map((w,i)=><div key={i} className="h-2 rounded bg-gray-100 border border-gray-300" style={{width:`${w*9}px`}}/>)}</div></div>
          <div><div className="h-1.5 bg-[#088395]/60 rounded w-2/5 mb-1" /><div className="h-1.5 bg-gray-200 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-5/6" /><div className="h-1.5 bg-gray-200 rounded w-4/6" /></div>
        </div>
      </div>
    ),
    "6": ( // Designer Portfolio — left accent strip
      <div className="h-full bg-white rounded shadow-sm overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#088395] to-purple-500" />
        <div className="pl-4 pr-3 pt-3 pb-3 space-y-2">
          <div className="flex items-center gap-2"><div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#088395] to-purple-400 flex-shrink-0" /><div><div className="h-2 bg-gray-800 rounded w-20 mb-1" /><div className="h-1.5 bg-gray-400 rounded w-14" /></div></div>
          <div className="grid grid-cols-3 gap-1">{[1,2,3].map(i=><div key={i} className="aspect-square rounded bg-gradient-to-br from-[#088395]/20 to-purple-200" />)}</div>
          <div><div className="h-1.5 bg-[#088395] rounded w-2/5 mb-1" /><div className="h-1.5 bg-gray-200 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-5/6" /></div>
          <div className="flex flex-wrap gap-1">{[3,4,3,5,3].map((w,i)=><div key={i} className="h-2 rounded-full bg-purple-100 border border-purple-300" style={{width:`${w*8}px`}}/>)}</div>
        </div>
      </div>
    ),
    "7": ( // Academic Scholar — centered header
      <div className="h-full bg-white rounded shadow-sm p-3 space-y-2">
        <div className="text-center space-y-1 border-b-2 border-gray-800 pb-2"><div className="h-2.5 bg-gray-800 rounded mx-auto w-3/5" /><div className="h-1.5 bg-gray-400 rounded mx-auto w-2/5" /><div className="h-1 bg-gray-300 rounded mx-auto w-3/4" /></div>
        <div><div className="h-1.5 bg-gray-700 rounded w-2/5 mb-1" /><div className="h-1.5 bg-gray-200 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-4/5" /></div>
        <div><div className="h-1.5 bg-gray-700 rounded w-1/3 mb-1" /><div className="h-1.5 bg-gray-200 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-3/4" /></div>
      </div>
    ),
    "8": ( // Startup Founder — gradient header, card grid
      <div className="h-full bg-white rounded shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-[#088395] to-teal-400 p-3"><div className="h-3 bg-white rounded w-4/5 mb-1" /><div className="h-1.5 bg-white/70 rounded w-1/2 mb-0.5" /><div className="h-1 bg-white/50 rounded w-3/4" /></div>
        <div className="p-3 space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 bg-[#088395]/10 rounded p-1.5 space-y-1"><div className="h-1.5 bg-[#088395] rounded w-3/4" /><div className="h-1 bg-gray-200 rounded w-full" /><div className="h-1 bg-gray-200 rounded w-4/5" /></div>
            <div className="flex-1 bg-[#088395]/10 rounded p-1.5 space-y-1"><div className="h-1.5 bg-[#088395] rounded w-3/4" /><div className="h-1 bg-gray-200 rounded w-full" /><div className="h-1 bg-gray-200 rounded w-3/4" /></div>
          </div>
          <div><div className="h-1.5 bg-[#088395]/70 rounded w-2/5 mb-1" /><div className="flex flex-wrap gap-1">{[3,4,3,5,3].map((w,i)=><div key={i} className="h-2 rounded-full bg-[#088395]/20" style={{width:`${w*8}px`}}/>)}</div></div>
        </div>
      </div>
    ),
    "9": ( // Minimalist Pro — ultra clean, black only
      <div className="h-full bg-white rounded shadow-sm p-4 space-y-3">
        <div className="h-3 bg-gray-900 rounded w-2/3" /><div className="h-1 bg-gray-300 rounded w-1/3" />
        {[1,2,3].map(i=><div key={i} className="space-y-1"><div className="h-px bg-gray-200 w-full" /><div className="h-1.5 bg-gray-400 rounded w-1/4 mt-1" /><div className="h-1.5 bg-gray-200 rounded w-full" /><div className="h-1.5 bg-gray-200 rounded w-5/6" /></div>)}
      </div>
    ),
    "10": ( // Bold Statement — dark background
      <div className="h-full bg-gray-900 rounded shadow-sm p-3 space-y-2">
        <div className="h-4 bg-[#088395] rounded w-5/6" /><div className="h-1.5 bg-white/60 rounded w-2/5" /><div className="h-px bg-[#088395]/50 w-full my-1" />
        <div><div className="h-1.5 bg-[#088395]/80 rounded w-2/5 mb-1" /><div className="h-1.5 bg-white/30 rounded w-full" /><div className="h-1.5 bg-white/30 rounded w-5/6" /><div className="h-1.5 bg-white/30 rounded w-4/6" /></div>
        <div><div className="h-1.5 bg-[#088395]/80 rounded w-1/3 mb-1" /><div className="flex gap-1 flex-wrap">{[3,4,3,5].map((w,i)=><div key={i} className="h-2 rounded bg-[#088395]/40 border border-[#088395]/60" style={{width:`${w*9}px`}}/>)}</div></div>
      </div>
    ),
  };

  return skeletons[id] ?? skeletons["1"];
}
