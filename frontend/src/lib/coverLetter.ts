export interface CoverLetterFields {
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

export const COVER_LETTER_SCHEMA = 'diversihire/cover-letter/v1';

export const EMPTY_COVER_LETTER: CoverLetterFields = {
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

// The cover_letters table stores a flat `content` text column, so we serialize
// the full structured letter (sender + recipient + paragraphs) into it as JSON
// with a schema marker. On read we detect the marker and rehydrate; older
// plain-text content (e.g. AI-generated and never edited) still works.
export function serializeCoverLetter(d: CoverLetterFields): string {
    return JSON.stringify({__schema: COVER_LETTER_SCHEMA, ...d});
}

export function tryParseCoverLetter(raw: string | null | undefined): Partial<CoverLetterFields> | null {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (!trimmed.startsWith('{')) return null;
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object' && parsed.__schema === COVER_LETTER_SCHEMA) {
            const {__schema: _ignored, ...fields} = parsed as Record<string, unknown>;
            return fields as Partial<CoverLetterFields>;
        }
    } catch {
        // Not JSON — caller can fall back to treating it as plain text.
    }
    return null;
}

// Render a stored cover letter (either structured JSON envelope or legacy
// plain text) into a human-readable string suitable for a read-only preview.
export function renderCoverLetterAsText(raw: string | null | undefined): string {
    const parsed = tryParseCoverLetter(raw);
    if (!parsed) return (raw ?? '').trim();

    const blocks: string[] = [];
    const senderLines = [parsed.yourName, parsed.yourAddress, parsed.yourEmail, parsed.yourPhone]
        .map((s) => (s ?? '').trim())
        .filter(Boolean);
    if (senderLines.length) blocks.push(senderLines.join('\n'));

    const recipientLines = [parsed.recipientName, parsed.recipientTitle, parsed.companyName, parsed.companyAddress]
        .map((s) => (s ?? '').trim())
        .filter(Boolean);
    if (recipientLines.length) blocks.push(recipientLines.join('\n'));

    for (const para of [parsed.opening, parsed.body, parsed.closing]) {
        const text = (para ?? '').trim();
        if (text) blocks.push(text);
    }

    return blocks.join('\n\n');
}
