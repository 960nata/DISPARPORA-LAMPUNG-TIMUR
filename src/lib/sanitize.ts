const DANGEROUS_TAGS = /<(script|iframe|object|embed|link|meta|base|form|input|button|svg|math)[\s\S]*?>/gi;
const CLOSING_DANGEROUS = /<\/(script|iframe|object|embed|form|svg|math)>/gi;
const EVENT_HANDLERS = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;
const JS_HREF = /\s+(?:href|src|action|formaction)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*'|javascript:[^\s>]*)/gi;
const DATA_URI = /\s+src\s*=\s*(?:"data:[^"]*"|'data:[^']*'|data:[^\s>]*)/gi;
const PROTOCOL_HANDLERS = /\s+(?:src|href)\s*=\s*(?:"(?:vbscript|data|mhtml):[^"]*"|'(?:vbscript|data|mhtml):[^']*')/gi;

export function sanitizeHtml(html: string): string {
  return html
    .replace(DANGEROUS_TAGS, "")
    .replace(CLOSING_DANGEROUS, "")
    .replace(EVENT_HANDLERS, "")
    .replace(JS_HREF, "")
    .replace(PROTOCOL_HANDLERS, "")
    .replace(DATA_URI, "");
}
