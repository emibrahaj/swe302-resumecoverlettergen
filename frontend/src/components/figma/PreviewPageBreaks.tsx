"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// A4 portrait at 96 dpi — the same constants the Playwright PDF service and the
// preview-public render target use, so the editor and the PDF agree on page size.
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

/**
 * Live-preview wrapper that renders its children at A4_WIDTH (794px), scales the
 * result to fit the parent pane, and paginates it the same way the PDF does.
 *
 * Pagination: after layout, any <section> or <header> that would straddle a page
 * boundary is pushed down (via margin-top) so it starts at the top of the next
 * page. A section is never cut in half, and a section title never sits alone at
 * the bottom of a page. This mirrors the `break-inside: avoid` rule the PDF render
 * (preview-public) applies, so the dashed page boundaries drawn here line up with
 * where the downloaded PDF actually splits.
 *
 * Two-column / sidebar templates (which contain an <aside>) can't be paginated by
 * pushing sections in DOM order — the columns interleave — so for those the flow
 * stays continuous in the editor; the PDF still breaks them cleanly via its own
 * break-inside CSS.
 */
export function PreviewPageBreaks({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(A4_WIDTH);
  const [contentH, setContentH] = useState(0);

  // Track the available width so we can scale the A4-width content to fit the pane.
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

  // Measure + paginate. Re-runs whenever the rendered resume reflows.
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // Sections we pushed on the last run, so we can undo before re-measuring.
    const pushed: Array<{ el: HTMLElement; prev: string }> = [];
    let frame = 0;
    let lastSetHeight = -1;

    const resetPushes = () => {
      for (const { el, prev } of pushed) el.style.marginTop = prev;
      pushed.length = 0;
    };

    const run = () => {
      try {
        resetPushes();

        // Sidebar templates have an <aside>; skip section-pushing for them.
        const hasSidebar = !!content.querySelector("aside");
        const scaleNow = Math.min(
          1,
          (containerRef.current?.clientWidth || A4_WIDTH) / A4_WIDTH,
        );

        if (!hasSidebar && scaleNow > 0) {
          const rootTop = content.getBoundingClientRect().top;
          const all = Array.from(
            content.querySelectorAll<HTMLElement>("section, header"),
          );
          // Only top-level units (ignore a section nested inside another one).
          const units = all.filter(
            (el) => !all.some((other) => other !== el && other.contains(el)),
          );

          let pushOffset = 0;
          for (const el of units) {
            const rect = el.getBoundingClientRect();
            // getBoundingClientRect is in scaled (visual) pixels because the
            // content carries a CSS transform; divide by the scale to get the
            // true A4-width layout coordinates, then add the offset introduced by
            // earlier pushes (margins shift everything below them).
            const top = (rect.top - rootTop) / scaleNow + pushOffset;
            const height = rect.height / scaleNow;
            if (height <= 0 || height > A4_HEIGHT) continue; // too tall to keep whole

            const pageOfTop = Math.floor(top / A4_HEIGHT);
            const pageOfBottom = Math.floor((top + height - 1) / A4_HEIGHT);
            if (pageOfTop !== pageOfBottom) {
              const push = (pageOfTop + 1) * A4_HEIGHT - top;
              if (push > 1 && push < A4_HEIGHT) {
                const base = parseFloat(getComputedStyle(el).marginTop) || 0;
                pushed.push({ el, prev: el.style.marginTop });
                el.style.marginTop = `${base + push}px`;
                pushOffset += push;
              }
            }
          }
        }

        const finalH = content.scrollHeight;
        lastSetHeight = finalH;
        setContentH(finalH);
      } catch {
        // Fail safe — fall back to continuous flow rather than break the preview.
        const finalH = content.scrollHeight;
        lastSetHeight = finalH;
        setContentH(finalH);
      }
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(run);
    };

    const ro = new ResizeObserver(() => {
      // Ignore the resize our own margin-pushes produced (height matches what we
      // just set); only re-run for genuine content reflow. Prevents an infinite
      // measure→mutate→measure loop.
      if (content.scrollHeight === lastSetHeight) return;
      schedule();
    });
    ro.observe(content);
    schedule();

    // Web fonts swap in after first paint and reflow the text, which changes
    // section heights — re-paginate once they're ready.
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(() => schedule()).catch(() => {});
    }

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
      resetPushes();
    };
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
