export class RequestBodyError extends Error {
    constructor(public readonly status: 400 | 413) {
        super(status === 413 ? 'Dados excedem o limite.' : 'Tamanho de requisição inválido.');
    }
}

// Content-Length is only an early rejection hint. Count the actual stream bytes,
// including requests with chunked transfer or a missing/incorrect length header.
export async function readRequestBody(request: Request, maxBytes: number): Promise<Buffer> {
    if (!Number.isSafeInteger(maxBytes) || maxBytes < 0) throw new RangeError('Invalid body limit.');
    const declared = request.headers.get('content-length');
    if (declared !== null) {
        const status = !/^\d+$/.test(declared) || !Number.isSafeInteger(Number(declared))
            ? 400 : Number(declared) > maxBytes ? 413 : null;
        if (status !== null) {
            void request.body?.cancel().catch(() => {});
            throw new RequestBodyError(status);
        }
    }
    if (!request.body) return Buffer.alloc(0);
    const reader = request.body.getReader();
    // One allocation bounds memory even if the stream uses millions of tiny
    // chunks. Retaining a separate Buffer per chunk would amplify allocation.
    const body = Buffer.alloc(maxBytes);
    let size = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value.byteLength > maxBytes - size) {
                void reader.cancel().catch(() => {});
                throw new RequestBodyError(413);
            }
            body.set(value, size);
            size += value.byteLength;
        }
        return body.subarray(0, size);
    } finally {
        reader.releaseLock();
    }
}
