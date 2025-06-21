import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const RSS_URL = 'https://www.animenewsnetwork.com/news/rss.xml?ann-edition=us';
    
    const response = await fetch(RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlData = await response.text();

    return new NextResponse(xmlData, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=900', // Cache for 15 minutes
      },
    });
  } catch (error) {
    console.error('Error fetching RSS feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news feed' },
      { status: 500 }
    );
  }
}
