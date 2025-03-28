import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      `https://gnews.io/api/v4/top-headlines?country=us&token=${process.env.GNEWS_API_KEY}&lang=en&max=10`,
      { next: { revalidate: 3600 } }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gnews API error:', errorText);
      throw new Error(`Gnews API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news', details: error instanceof Error ? error.message : 'route error' },
      { status: 500 }
    );
  }
}
