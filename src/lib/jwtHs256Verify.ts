/**
 * HS256 JWT verify for Next.js middleware (Edge runtime) without the `jose` package.
 * Compatible with typical `jsonwebtoken` / `jose` HS256 payloads used by the admin API.
 */

function base64UrlToBytes(base64url: string): Uint8Array {
    const pad = base64url.length % 4;
    const normalized = base64url.replace(/-/g, "+").replace(/_/g, "/") + (pad ? "=".repeat(4 - pad) : "");
    const binary = atob(normalized);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        out[i] = binary.charCodeAt(i);
    }
    return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
        diff |= a[i] ^ b[i];
    }
    return diff === 0;
}

export type JwtPayload = Record<string, unknown>;

export async function verifyJwtHs256(token: string, secret: string): Promise<JwtPayload | null> {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encHeader, encPayload, encSig] = parts;
    if (!encHeader || !encPayload || !encSig) return null;

    let header: { alg?: string };
    try {
        const headerBytes = base64UrlToBytes(encHeader);
        header = JSON.parse(new TextDecoder().decode(headerBytes)) as { alg?: string };
    } catch {
        return null;
    }

    if (header.alg !== "HS256") return null;

    let payload: JwtPayload;
    try {
        const payloadBytes = base64UrlToBytes(encPayload);
        payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as JwtPayload;
    } catch {
        return null;
    }

    const exp = payload.exp;
    if (typeof exp === "number" && exp * 1000 < Date.now()) {
        return null;
    }

    const data = new TextEncoder().encode(`${encHeader}.${encPayload}`);
    const expectedSig = base64UrlToBytes(encSig);

    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );

    const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, data));
    if (!timingSafeEqual(signature, expectedSig)) {
        return null;
    }

    return payload;
}
