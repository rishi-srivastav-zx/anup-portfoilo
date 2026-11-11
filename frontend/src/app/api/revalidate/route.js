import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function safeTimingCompare(provided, expected) {
  if (!provided || !expected || typeof provided !== 'string' || typeof expected !== 'string') {
    return false;
  }
  const provBuf = Buffer.from(provided);
  const expBuf = Buffer.from(expected);
  if (provBuf.length !== expBuf.length) {
    crypto.timingSafeEqual(expBuf, expBuf);
    return false;
  }
  return crypto.timingSafeEqual(provBuf, expBuf);
}

/**
 * On-Demand Cache Revalidation API Route (Next.js 16 App Router)
 * Allows the backend publishing service to purge the Next.js Route Cache for
 * the blog catalog (/blog), sitemap (/sitemap.xml), and individual published blog pages.
 */
export async function POST(request) {
  try {
    const headerSecret = request.headers.get('x-revalidate-secret');
    const authHeader = request.headers.get('authorization');
    const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const providedSecret = headerSecret || bearerSecret || body.secret;
    const expectedSecret =
      process.env.REVALIDATE_SECRET ||
      process.env.CRON_SECRET ||
      'anup-portfolio-revalidate-secret';

    if (!safeTimingCompare(providedSecret, expectedSecret)) {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing revalidation secret.' },
        { status: 401 }
      );
    }

    const rawSlug = typeof body.slug === 'string' ? body.slug.trim() : null;
    const revalidatedPaths = ['/blog', '/sitemap.xml'];

    // Purge blog listing and sitemap route caches
    revalidatePath('/blog');
    revalidatePath('/sitemap.xml');

    // Purge specific article route cache if valid slug is provided
    if (rawSlug && SLUG_RE.test(rawSlug)) {
      revalidatePath(`/blog/${rawSlug}`);
      revalidatedPaths.push(`/blog/${rawSlug}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Revalidation completed successfully.',
      paths: revalidatedPaths,
      revalidatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Internal revalidation error.' },
      { status: 500 }
    );
  }
}

