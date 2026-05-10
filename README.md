# swe302-resumecoverlettergen
An application dedicated to generating resumes and cover letters.

## Installation
### frontend
cd frontend && 
npm install &&
npm run dev

### Frontend libraries
npm install cmdk vaul react-day-picker date-fns embla-carousel-react input-otp react-resizable-panels next-themes radix-ui lucide-react motion sonner recharts class-variance-authority clsx tailwind-merge react-hook-form &&
npm install -D tw-animate-css

### Backend libraries
pip install -r requirements.txt &&
cd backend &&
uvicorn main:app --reload

## Adding a New Template

Adding a template requires changes to 3 files:

### 1. Register it — `src/config/templates.config.ts`
Add an entry to the `TEMPLATES` array:
```ts
{ id: '11', name: 'My Template', category: 'simple', isPremium: false }
```
This is the only step needed to make it appear in all galleries and carousels.

### 2. Design the card preview — `src/components/figma/TemplateSkeleton.tsx`
Add a case to the `skeletons` map using `div` and Tailwind classes to sketch
the layout. This is what users see when browsing templates.

### 3. Design the live preview — `src/components/figma/ResumePreview.tsx`
Add a renderer function `T11` and register it in `TEMPLATE_MAP`. The renderer
receives all CV data via the `d` prop. **Always iterate `d.sectionOrder`
instead of hardcoding sections**, this is what makes drag-and-drop reordering
work.
```ts
function T11({ d }: { d: CVData }) {
  return (
    <div style={{ fontFamily: d.fontFamily }}>
      {d.sectionOrder.filter(id => hasContent(id, d)).map(id => (
        <div key={id}>
          <h2>{label(id, d.customSections)}</h2>
          <SectionBody id={id} d={d} accent={d.accentColor} />
        </div>
      ))}
    </div>
  );
}

// then add to TEMPLATE_MAP:
'11': T11,
```
