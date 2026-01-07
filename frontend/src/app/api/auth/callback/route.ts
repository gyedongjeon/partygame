import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Code missing' }, { status: 400 });
    }

    // Exchange the one-time code for the JWT via backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    console.log('[AuthDebug] Exchange started. Code:', code ? '***' : 'missing');
    console.log('[AuthDebug] Backend URL:', backendUrl);

    try {
        const fullUrl = `${backendUrl}/v1/auth/exchange`;
        console.log('[AuthDebug] Fetching:', fullUrl);

        const exchangeResponse = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });

        console.log('[AuthDebug] Response status:', exchangeResponse.status);

        if (!exchangeResponse.ok) {
            const errorText = await exchangeResponse.text();
            console.error('[AuthDebug] Exchange failed body:', errorText);

            // Try to parse JSON if possible catch for better error message
            let errorMessage = 'Code exchange failed';
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorMessage;
            } catch (e) { /* ignore json parse error */ }

            return NextResponse.json(
                { error: errorMessage },
                { status: exchangeResponse.status }
            );
        }

        const { access_token } = await exchangeResponse.json();
        console.log('[AuthDebug] Exchange success. Token received.');

        // Redirect to home page
        const response = NextResponse.redirect(new URL('/', request.url));

        // Set the cookie on the response (First-Party Cookie!)
        response.cookies.set('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none', // Changed to none for cross-domain support
            path: '/',
            maxAge: 24 * 60 * 60, // 1 day
        });

        // Set a public cookie for JS access (Socket.io/Client-side fetch)
        response.cookies.set('auth_token', access_token, {
            httpOnly: false, // JS can read this
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Lax is fine for this as it's read by client JS
            path: '/',
            maxAge: 24 * 60 * 60,
        });

        return response;
    } catch (error) {
        console.error('[AuthDebug] Critical error:', error);
        return NextResponse.json(
            { error: 'Failed to exchange code' },
            { status: 500 }
        );
    }
}
