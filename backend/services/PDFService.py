import asyncio
from concurrent.futures import ThreadPoolExecutor
from playwright.async_api import async_playwright

# A4 portrait at 96 DPI = 1123px tall, 794px wide. Used by measure_overflow.
A4_HEIGHT_PX = 1123
A4_WIDTH_PX = 794

# Uvicorn on Windows uses SelectorEventLoop which can't spawn subprocesses.
# Run Playwright in a dedicated thread that creates its own ProactorEventLoop.
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="playwright")


def _run_in_new_loop(coro_fn, *args, **kwargs):
    """Call coro_fn(*args, **kwargs) inside a fresh event loop in a worker thread."""
    def _thread():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(coro_fn(*args, **kwargs))
        finally:
            loop.close()

    future = _executor.submit(_thread)
    return future.result()


async def _pw_generate_pdf(html_content: str, output_path: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.set_content(html_content, wait_until="networkidle")
        await page.emulate_media(media="print")
        await page.pdf(
            path=output_path,
            format="A4",
            print_background=True,
            margin={"top": "0px", "bottom": "0px", "left": "0px", "right": "0px"},
        )
        await browser.close()


async def _pw_generate_pdf_from_url(url: str, output_path: str, wait_selector: str | None):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        try:
            page = await browser.new_page(viewport={"width": A4_WIDTH_PX, "height": A4_HEIGHT_PX})
            await page.goto(url, wait_until="networkidle", timeout=30_000)
            if wait_selector:
                try:
                    await page.wait_for_selector(wait_selector, timeout=15_000)
                except Exception:
                    pass
            await page.emulate_media(media="print")
            await page.pdf(
                path=output_path,
                format="A4",
                print_background=True,
                margin={"top": "0px", "bottom": "0px", "left": "0px", "right": "0px"},
            )
        finally:
            await browser.close()


async def _pw_measure_overflow(html_content: str) -> dict:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": A4_WIDTH_PX, "height": A4_HEIGHT_PX})
        try:
            await page.set_content(html_content, wait_until="networkidle")
            await page.emulate_media(media="print")
            scroll_height = await page.evaluate(
                "() => Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)"
            )
        finally:
            await browser.close()
    scroll_height = int(scroll_height or 0)
    pages = max(1, (scroll_height + A4_HEIGHT_PX - 1) // A4_HEIGHT_PX)
    return {
        "scroll_height": scroll_height,
        "viewport_height": A4_HEIGHT_PX,
        "overflow_px": max(0, scroll_height - A4_HEIGHT_PX),
        "pages": pages,
        "fits_single_page": scroll_height <= int(A4_HEIGHT_PX * 1.02),
    }


class PDFService:
    def __init__(self):
        self.template_path = "templates/modern_professional.html"
        self.fonts_dir = "fonts"

    @staticmethod
    async def generate_pdf(html_content: str, output_path: str):
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            _executor, lambda: asyncio.run(_pw_generate_pdf(html_content, output_path))
        )

    @staticmethod
    async def generate_pdf_from_url(url: str, output_path: str, wait_selector: str | None = '[data-preview="public"]') -> None:
        """Navigate to a URL and PDF the rendered page."""
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            _executor, lambda: asyncio.run(_pw_generate_pdf_from_url(url, output_path, wait_selector))
        )

    @staticmethod
    async def measure_overflow(html_content: str) -> dict:
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            _executor, lambda: asyncio.run(_pw_measure_overflow(html_content))
        )