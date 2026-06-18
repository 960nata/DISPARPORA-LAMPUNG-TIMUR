const DANGEROUS_TAGS = /<(script|iframe|object|embed|link|meta|base|form|input|button|svg|math)[\s\S]*?>/gi;
const CLOSING_DANGEROUS = /<\/(script|iframe|object|embed|form|svg|math)>/gi;
const EVENT_HANDLERS = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;
const JS_HREF = /\s+(?:href|src|action|formaction|data)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi;
const DATA_URI = /\s+src\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi;

export function sanitizeHtml(html: string): string {
  return html
    .replace(DANGEROUS_TAGS, "")
    .replace(CLOSING_DANGEROUS, "")
    .replace(EVENT_HANDLERS, "")
    .replace(JS_HREF, "")
    .replace(DATA_URI, "");
}
