// JSON escaping alone does not stop the HTML parser from closing a script tag.
export function serializeJsonLd(value: Record<string, unknown>): string {
    return JSON.stringify(value).replace(/</g, '\\u003c');
}
