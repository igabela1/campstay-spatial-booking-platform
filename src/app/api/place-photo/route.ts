import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Missing photo name' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing GOOGLE_MAPS_API_KEY in .env' },
        { status: 500 }
      );
    }

    const photoMediaName = `${name}/media`;

    const response = await fetch(
      `https://places.googleapis.com/v1/${photoMediaName}?maxWidthPx=800&key=${apiKey}`,
      {
        method: 'GET',
        redirect: 'follow',
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to load place photo' },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Place photo route error:', error);

    return NextResponse.json(
      { error: 'Something went wrong while loading place photo' },
      { status: 500 }
    );
  }
}