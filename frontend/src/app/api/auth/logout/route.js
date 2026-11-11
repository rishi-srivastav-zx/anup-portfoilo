import { NextResponse } from 'next/server';
import { SERVER_URL } from '@/api/utils/baseUrl';

const BACKEND_URL = SERVER_URL;

export async function POST(request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';

    // 1. Forward to Express backend if active
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: cookieHeader,
          'X-Requested-With': 'XMLHttpRequest',
          Origin: request.headers.get('origin') || 'http://localhost:3000',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
    } catch {
      // Backend offline
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });

    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
