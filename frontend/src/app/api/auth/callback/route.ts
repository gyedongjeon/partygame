import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Code missing' }, { status: 400 });
    }

    // Exchange the one-time code for the JWT via backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
        const exchangeResponse = await fetch(`${backendUrl}/v1/auth/exchange`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });

        if (!exchangeResponse.ok) {
            const errorData = await exchangeResponse.json();
            return NextResponse.json(
                { error: errorData.message || 'Code exchange failed' },
                { status: exchangeResponse.status }
            );
        }

        const { access_token } = await exchangeResponse.json();

        // Redirect to home page
        const response = NextResponse.redirect(new URL('/', request.url));

        // Set the cookie on the response (First-Party Cookie!)
        response.cookies.set('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 24 * 60 * 60, // 1 day
        });

        return response;
    } catch (error) {
        console.error('Code exchange error:', error);
        return NextResponse.json(
            { error: 'Failed to exchange code' },
            { status: 500 }
        );
    }
}
