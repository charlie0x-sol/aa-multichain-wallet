import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const { address } = params;
    
    // Validate address (basic check)
    if (!address) {
      return NextResponse.json(
        { error: 'Invalid address' },
        { status: 400 }
      );
    }

    const duneApiKey = process.env.DUNE_API_KEY;

    // If no API key, return mock data for development
    if (!duneApiKey) {
      return NextResponse.json({
        timestamps: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        values: [2100, 2300, 2250, 2400, 2600, 2550, 2800]
      });
    }

    // Example Dune API call
    // const QUERY_ID = 123456;
    // const response = await fetch(
    //   `https://api.dune.com/api/v1/query/${QUERY_ID}/results?address=${address}`,
    //   {
    //     headers: {
    //       'X-Dune-API-Key': duneApiKey,
    //     },
    //   }
    // );

    // const data = await response.json();
    // return NextResponse.json(data);

    return NextResponse.json({
      timestamps: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [2100, 2300, 2250, 2400, 2600, 2550, 2800]
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
