"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// A4 portrait at 96 dpi — same constants the Playwright PDF service uses.
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

/**
 * Live-preview wrapper that renders its children at A4_WIDTH (794px) and scales
 * the result to fit the parent container. Why bother: the editor's preview pane
 * is much narrower than A4, so if you render the resume directly at the pane's
 * width, text reflows narrower → looks much taller than it actually is in the
 * PDF. That makes the page-break indicator wrong (says "Page 2 starts here"
 * when in reality everything fits on one page).
 *
 * By rendering at 794px and applying transform: scale, the natural pixel
 * dimensions match the Playwright PDF render 1:1. The page-break dividers
 * appear exactly where Chromium will split the PDF.
 */
export function PreviewPageBreaks({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(A4_WIDTH);
  const [contentH, setContentH] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerW(entry.contentRect.width || A4_WIDTH);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContentH(entry.contentRect.height);
      }
    });
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, []);

  // Never upscale past 1; we only shrink the A4-width layout to fit narrow panes.
  const scale = Math.min(1, containerW / A4_WIDTH);
  const scaledHeight = contentH * scale;
  const pageCount = contentH > 0 ? Math.max(1, Math.ceil(contentH / A4_HEIGHT)) : 1;

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: scaledHeight || undefined }}
    >
      {/* Scaled bounding box, centered horizontally if container is wider than 794. */}
      <div
        className="absolute top-0"
        style={{
          left: "50%",
          width: `${A4_WIDTH * scale}px`,
          height: scaledHeight || undefined,
          transform: "translateX(-50%)",
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: `${A4_WIDTH}px`,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>

        {Array.from({ length: pageCount - 1 }).map((_, i) => {
          const top = A4_HEIGHT * (i + 1) * scale;
          const nextPage = i + 2;
          return (
            <div
              key={i}
              aria-hidden="true"
              className="pointer-events-none absolute left-0 right-0"
              style={{ top: `${top}px` }}
            >
              <div className="relative border-t-2 border-dashed border-red-500/80">
                <span className="absolute -top-[10px] left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-medium px-2 py-[2px] rounded-full shadow-sm whitespace-nowrap">
                  Page {nextPage} starts here
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {pageCount > 1 && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 right-2 bg-gray-900/85 text-white text-[10px] px-2 py-1 rounded-full shadow"
        >
          {pageCount} pages
        </div>
      )}
    </div>
  );
}
