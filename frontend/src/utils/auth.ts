export function getToken(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
    if (match) return match[2];
    return null;
}

export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const token = getToken();
    const headers = new Headers(init?.headers);

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    return fetch(input, {
        ...init,
        headers,
    });
}
