import { NextRequest, NextResponse } from 'next/server';
// We do NOT use 'cookies' from 'next/headers' here directly to set it in response,
// we use NextResponse.cookies.set() which is the App Router way for Route Handlers.

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Token missing' }, { status: 400 });
    }

    // Redirect to home page
    const response = NextResponse.redirect(new URL('/', request.url));

    // Set the cookie on the response
    // First-Party Cookie!
    response.cookies.set('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure in prod
        sameSite: 'lax', // Lax is fine for first-party navigation (and needed for OAuth redirect sometimes)
        path: '/',
        maxAge: 24 * 60 * 60, // 1 day (matches backend expiry)
    });

    return response;
}
