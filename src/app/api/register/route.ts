import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fintechapi.softsuitetech.com/public/api';

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const upstreamResponse = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const data = await upstreamResponse.json().catch(() => ({}));

    return NextResponse.json(data, {
      status: upstreamResponse.status,
    });
  } catch (error) {
    console.error('Register proxy error:', error);
    return NextResponse.json(
      { message: 'Unable to register at this time.' },
      { status: 500 },
    );
  }
}

