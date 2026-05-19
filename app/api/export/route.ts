import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, format, quality } = body;

    // Validate request
    if (!projectId || !format) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start export job
    const jobId = `job-${Date.now()}`;

    // Return job ID for polling
    return NextResponse.json({
      jobId,
      status: 'queued',
      message: 'Export job started',
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json(
      { error: 'Missing job ID' },
      { status: 400 }
    );
  }

  // Return job status (mock)
  return NextResponse.json({
    jobId,
    status: 'completed',
    progress: 100,
    url: `/exports/${jobId}.pdf`,
  });
}
